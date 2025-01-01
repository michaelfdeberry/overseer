using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Timers;

using MQTTnet;
using MQTTnet.Client;

using Newtonsoft.Json;

using Overseer.Models;

using JsonSerializer = System.Text.Json.JsonSerializer;

namespace Overseer.Machines.Providers
{
  public class BambuMachineProvider : MachineProvider<BambuMachine>
  {
    public override event EventHandler<EventArgs<MachineStatus>> StatusUpdate;

    private IMqttClient _mqttClient;
    Timer _timer;
    DateTime? _lastStatusUpdate;

    public BambuMachineProvider(BambuMachine machine)
    {
      Machine = machine;
    }

    private async Task SendPrintCommand(object command)
    {
      if (_mqttClient == null) return;

      await _mqttClient.PublishAsync(new MqttApplicationMessageBuilder()
          .WithTopic($"device/{Machine.Serial}/request")
          .WithPayload(JsonSerializer.SerializeToUtf8Bytes(new { print = command }))
          .Build());
    }

    public override async Task ExecuteGcode(string command)
    {
      await SendPrintCommand(new { sequence_id = "0", command = "gcode_line", param = command });
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
      machine.WebCamUrl = $"rtsps://{Machine.Url}:322/streaming/live/1";
      // not supporting webcam orientation since it's fixed
      // not supporting ams in overseer
      // all bambu printers have a single bed, hot end, and extruder 
      machine.Tools =
      [
        new (MachineToolType.Heater, 0, "bed"),
        new (MachineToolType.Heater, 1),
        new (MachineToolType.Extruder, 0),
      ];

      return Task.CompletedTask;
    }

    public override void Start(int interval)
    {
      Task.Run(Connect);

      _timer?.Dispose();
      _timer = new(interval);
      _timer.Elapsed += async (sender, args) =>
      {
        // if we're not connected, try to reconnect
        if (_mqttClient == null || !_mqttClient.IsConnected)
        {
          await Connect();
        }

        // since it's mqtt updates are pushed, but if we haven't received an update in the last interval, request one
        if (_lastStatusUpdate.HasValue && DateTime.Now.Subtract(_lastStatusUpdate.Value).TotalSeconds < interval) return;

        await _mqttClient?.PublishAsync(new MqttApplicationMessageBuilder()
          .WithTopic($"device/{Machine.Serial}/request")
          .WithPayload(JsonSerializer.SerializeToUtf8Bytes(new { pushing = new { command = "pushall" } }))
          .Build());
      };
      _timer.Start();
    }

    async Task Connect()
    {
      _mqttClient?.DisconnectAsync().Wait();
      _mqttClient?.Dispose();

      _mqttClient = new MqttFactory().CreateMqttClient();
      var mqttClientOptions = new MqttClientOptionsBuilder()
          .WithProtocolVersion(MQTTnet.Formatter.MqttProtocolVersion.V311)
          .WithCredentials("bblp", Machine.AccessCode)
          .WithTlsOptions((options) => options
            .UseTls()
            .WithCertificateValidationHandler((args) => args.Certificate.Issuer.Contains("BBL Technologies Co., Ltd"))
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

    Task OnMessage(MqttApplicationMessageReceivedEventArgs args)
    {
      var payload = args.ApplicationMessage.PayloadSegment;
      var json = Encoding.UTF8.GetString(payload.Array.Where(b => b != 0).ToArray());
      dynamic message = JsonConvert.DeserializeObject(json);

      // if the gcode_state is not present, ignore the message
      if (message.print?.gcode_state == null)
      {
        return Task.CompletedTask;
      }

      var print = message.print;
      var status = new MachineStatus
      {
        MachineId = Machine.Id,
        State = print.gcode_state switch
        {
          "RUNNING" => MachineState.Operational,
          "PREPARING" => MachineState.Operational,
          "PAUSE" => MachineState.Paused,
          _ => MachineState.Idle,
        }
      };

      if (status.State != MachineState.Idle)
      {
        // if it's not idle, we can get the progress and estimated time remaining
        status.FanSpeed = print.cooling_fan_speed / 15 * 100;
        status.Progress = print.mc_percent;
        status.EstimatedTimeRemaining = print.mc_remaining_time * 60;
        // only the remaining time is available, so we calculate the elapsed time
        status.ElapsedJobTime = Convert.ToInt32(status.EstimatedTimeRemaining / (100 - status.Progress));

        // the feed rate and flow rate are not available from the printer
        status.FeedRate = 100;
        status.FlowRates = new() { { 0, 100f } };
      }

      status.Temperatures = new(){
        { 0 , new TemperatureStatus { HeaterIndex = 0, Actual = print.bed_temper, Target = print.bed_target_temper } },
        { 1 , new TemperatureStatus { HeaterIndex = 1, Actual = print.nozzle_temper, Target = print.nozzle_target_temper } },
      };

      StatusUpdate?.Invoke(this, new EventArgs<MachineStatus>(status));
      _lastStatusUpdate = DateTime.Now;
      return Task.CompletedTask;
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
  }
}