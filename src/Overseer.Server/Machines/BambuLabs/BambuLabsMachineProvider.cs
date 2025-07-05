using System.Buffers;
using System.Text;
using System.Text.Json;
using MQTTnet;
using Overseer.Server.Channels;
using Overseer.Server.Machines.BambuLabs.Models;
using Overseer.Server.Models;
using Timer = System.Timers.Timer;

namespace Overseer.Server.Machines.BambuLabs;

public class BambuMachineProvider(BambuMachine machine, IMachineStatusChannel machineStatusChannel) : MachineProvider<BambuMachine>
{
  private IMqttClient? _mqttClient;
  Timer? _timer;
  DateTime? _lastStatusUpdate;

  public override BambuMachine Machine
  {
    get => machine;
    protected set => machine = value;
  }

  private async Task SendPrintCommand(object command)
  {
    if (_mqttClient == null)
      return;

    await _mqttClient.PublishAsync(
      new MqttApplicationMessageBuilder()
        .WithTopic($"device/{Machine.Serial}/request")
        .WithPayload(JsonSerializer.SerializeToUtf8Bytes(new { print = command }))
        .Build()
    );
  }

  public override async Task ExecuteGcode(string command)
  {
    await SendPrintCommand(
      new
      {
        sequence_id = "0",
        command = "gcode_line",
        param = command,
      }
    );
  }

  public override async Task ResumeJob()
  {
    await SendPrintCommand(new { sequence_id = "0", command = "resume" });
  }

  public override async Task PauseJob()
  {
    await SendPrintCommand(new { sequence_id = "0", command = "pause" });
  }

  public override async Task CancelJob()
  {
    await SendPrintCommand(new { sequence_id = "0", command = "stop" });
  }

  public override Task LoadConfiguration(Machine machine)
  {
    Machine = (BambuMachine)machine;
    // this url seems to be x1 series only, and it's not accessible from a browser
    // and will require some kind of proxy to access it. So this will need to be provided
    // by the user.
    // Machine.WebCamUrl = $"rtsps://{Machine.Url}:322/streaming/live/1";

    // not supporting ams in overseer
    // all bambu printers have a single bed, hot end, and extruder
    Machine.Tools = [new(MachineToolType.Heater, 0, "bed"), new(MachineToolType.Heater, 1), new(MachineToolType.Extruder, 0)];

    return Task.CompletedTask;
  }

  public override void Start(int interval)
  {
    Task.Run(Connect);

    _timer?.Dispose();
    _timer = new(interval);
    _timer.Elapsed += async (sender, args) =>
    {
      if (_mqttClient == null || !_mqttClient.IsConnected)
      {
        if (_mqttClient != null)
        {
          await _mqttClient.DisconnectAsync();
          _mqttClient?.Dispose();
        }
        await Connect();
      }

      // since it's mqtt updates are pushed, but if we haven't received an update in the last interval, request one
      if (_lastStatusUpdate.HasValue && DateTime.UtcNow.Subtract(_lastStatusUpdate.Value).TotalSeconds < interval)
        return;

      if (_mqttClient != null)
      {
        await _mqttClient.PublishAsync(
          new MqttApplicationMessageBuilder()
            .WithTopic($"device/{Machine.Serial}/request")
            .WithPayload(JsonSerializer.SerializeToUtf8Bytes(new { pushing = new { command = "pushall" } }))
            .Build()
        );
      }
    };
    _timer.Start();
  }

  async Task Connect()
  {
    if (_mqttClient == null)
      return;

    var mqttFactory = new MqttClientFactory();
    _mqttClient = mqttFactory.CreateMqttClient();
    var mqttClientOptions = new MqttClientOptionsBuilder()
      .WithProtocolVersion(MQTTnet.Formatter.MqttProtocolVersion.V311)
      .WithCredentials("bblp", Machine.AccessCode)
      .WithTlsOptions(
        (options) => options.UseTls().WithCertificateValidationHandler((args) => args.Certificate.Issuer.Contains("BBL Technologies Co., Ltd"))
      )
      .WithTcpServer(Machine.Url, 8883)
      .Build();

    _mqttClient.ApplicationMessageReceivedAsync += OnMessage;

    var result = await _mqttClient.ConnectAsync(mqttClientOptions);
    if (result.ResultCode != MqttClientConnectResultCode.Success)
    {
      Log.Error($"Failed to connect to MQTT server: {result.ResultCode}");
      return;
    }

    await _mqttClient.SubscribeAsync($"device/{Machine.Serial}/report");
  }

  async Task OnMessage(MqttApplicationMessageReceivedEventArgs args)
  {
    var payload = args.ApplicationMessage.Payload;
    var json = Encoding.UTF8.GetString([.. payload.ToArray().Where(b => b != 0)]);
    var message = JsonSerializer.Deserialize<Message>(json);

    // if the gcode_state is not present, ignore the message
    if (message?.Print?.GCodeState == null)
    {
      return;
    }

    var status = new MachineStatus
    {
      MachineId = Machine.Id,
      State = message.Print.GCodeState switch
      {
        "RUNNING" => MachineState.Operational,
        "PREPARING" => MachineState.Operational,
        "PAUSE" => MachineState.Paused,
        _ => MachineState.Idle,
      },
    };

    if (status.State != MachineState.Idle)
    {
      // if it's not idle, we can get the progress and estimated time remaining
      status.FanSpeed = Convert.ToInt32(message.Print.FanSpeed) / 15 * 100;
      status.Progress = message.Print.Progress;
      status.EstimatedTimeRemaining = message.Print.RemainingTime * 60;
      // only the remaining time is available, so we calculate the elapsed time
      var total = (int)(status.EstimatedTimeRemaining / (1 - status.Progress / 100));
      status.ElapsedJobTime = total - status.EstimatedTimeRemaining;
      status.FeedRate = message.Print.Speed;
      // the flow rate is not available from the printer, just default to 100%
      status.FlowRates = new() { { 0, 100f } };
    }

    status.Temperatures = new()
    {
      {
        0,
        new TemperatureStatus
        {
          HeaterIndex = 0,
          Actual = message.Print.BedTemperature,
          Target = message.Print.BedTargetTemperature,
        }
      },
      {
        1,
        new TemperatureStatus
        {
          HeaterIndex = 1,
          Actual = message.Print.NozzleTemperature,
          Target = message.Print.NozzleTargetTemperature,
        }
      },
    };

    await machineStatusChannel.WriteAsync(status);
    _lastStatusUpdate = DateTime.UtcNow;
  }

  public override void Stop()
  {
    _timer?.Stop();
    _timer?.Dispose();
    _timer = null;

    _mqttClient?.DisconnectAsync().Wait();
    _mqttClient?.Dispose();
    _mqttClient = null;
  }

  protected override void OnDisposing()
  {
    _timer?.Dispose();
    _mqttClient?.Dispose();
  }
}
