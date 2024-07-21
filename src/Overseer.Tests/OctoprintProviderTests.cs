using Moq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using NUnit.Framework.Legacy;
using Overseer.Machines;
using Overseer.Machines.Providers;
using Overseer.Models;
using Overseer.Tests.Properties;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Overseer.Tests
{
    [TestFixture]
    public class OctoprintProviderTests
    {
        OctoprintMachine _machine;
        IMachineProvider _provider;
        Mock<RestMachineConnector<OctoprintMachine>> _connector;

        [SetUp]
        public void Setup()
        {
            _machine = new OctoprintMachine();
            _machine.Name = "UnitTestPrinter1";
            _machine.Url = "http://octoprint.local/machine1";
            _machine.ApiKey = Guid.NewGuid().ToString();

            _connector = new Mock<RestMachineConnector<OctoprintMachine>>();
            _connector.Setup(x => x.ProcessUrl(It.IsAny<string>(), It.IsAny<string>()))
                .Returns<string, string>((p, r) => {
                    return RestMachineConnector<OctoprintMachine>.ProcessUri(p, r).ToString();
                });
            _connector
                .Setup(p => p.Request(
                    It.IsAny<OctoprintMachine>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<IEnumerable<(string name, string value)>>(),
                    It.IsAny<object>(),
                    It.IsAny<CancellationToken>()
                ))
                .Returns((OctoprintMachine machine, string r, string m, IEnumerable<(string, string)> q, object b, CancellationToken c) =>
                {
                    switch (r)
                    {
                        case "api/printer":
                            return Task.FromResult(JObject.Parse(Resources.OctoprintPrinter));
                        case "api/job":
                            return Task.FromResult(JObject.Parse(Resources.OctoprintJob));
                        case "api/settings":
                            return Task.FromResult(JObject.Parse(Resources.OctoprintSettings));
                        case "api/printerprofiles":
                            return Task.FromResult(JObject.Parse(Resources.OctoprintProfiles));
                        default:
                            return Task.FromResult<JObject>(null);
                    }
                });
            _provider = new OctoprintMachineProvider(_connector.Object, _machine);
        }

        [Test]
        public async Task ShouldLoadConfiguration()
        {
            //LoadConfiguration is called anytime a printer is added or updated
            await _provider.LoadConfiguration(_machine);
            
            ClassicAssert.AreEqual("http://octoprint.local/webcam/?action=stream", _machine.WebCamUrl);
            ClassicAssert.AreEqual("http://octoprint.local:8080/?action=snapshot", _machine.SnapshotUrl);                                    
            ClassicAssert.AreEqual("CR10", _machine.Profile);
            ClassicAssert.AreEqual(1, _machine.AvailableProfiles.Count);
            ClassicAssert.AreEqual(_machine.Profile, _machine.AvailableProfiles.First().Value);
            ClassicAssert.AreEqual(3, _machine.Tools.Count());            
            ClassicAssert.IsNotNull(_machine.GetHeater(-1)); //bed
            ClassicAssert.IsNotNull(_machine.GetHeater(0)); //hotend
            ClassicAssert.IsNotNull(_machine.GetExtruder(0)); //extruder            
        }

        [Test]
        public void ShouldRethrowOverseerException()
        {
            var exception = new OverseerException("Certificate_Exception");
            try
            {
                _connector
                     .Setup(p => p.Request(
                        It.IsAny<OctoprintMachine>(),
                        It.IsAny<string>(),
                        It.IsAny<string>(),
                        It.IsAny<IEnumerable<(string name, string value)>>(),
                        It.IsAny<object>(),
                        It.IsAny<CancellationToken>()
                    ))
                    .Throws(new Exception("out exception", exception));

                _provider.LoadConfiguration(_machine);
            }
            catch (Exception e)
            {
                ClassicAssert.AreSame(typeof(OverseerException), e.GetType());
                ClassicAssert.AreEqual(exception, e);
            }
        }

        [Test]
        public void ShouldThrowInvalidApiKeyError()
        {
            try
            {
                _connector
                    .Setup(p => p.Request(
                        It.IsAny<OctoprintMachine>(),
                        It.IsAny<string>(),
                        It.IsAny<string>(),
                        It.IsAny<IEnumerable<(string name, string value)>>(),
                        It.IsAny<object>(),
                        It.IsAny<CancellationToken>()
                    ))
                    .Throws(new Exception("The service responded with status code FORBIDDEN(403): Invalid API key"));

                _provider.LoadConfiguration(_machine);
            }
            catch (Exception e)
            {
                ClassicAssert.AreSame(typeof(OverseerException), e.GetType());
                ClassicAssert.AreEqual("octoprint_invalid_key", e.Message);
            }
        }

        [Test]
        public void ShouldThrowConnectionFailureError()
        {
            try
            {
                _connector
                    .Setup(p => p.Request(
                        It.IsAny<OctoprintMachine>(),
                        It.IsAny<string>(),
                        It.IsAny<string>(),
                        It.IsAny<IEnumerable<(string name, string value)>>(),
                        It.IsAny<object>(),
                        It.IsAny<CancellationToken>()
                    ))
                    .Throws(new Exception("The service responded with status code NOTFOUND(404)"));

                _provider.LoadConfiguration(_machine);
            }
            catch (Exception e)
            {
                ClassicAssert.AreSame(typeof(OverseerException), e.GetType());
                ClassicAssert.AreEqual("printer_connect_failure", e.Message);
            }
        }

        [Test]
        public async Task ShouldGetPrinterStatus()
        {
            await _provider.LoadConfiguration(_machine);
            var status = await _provider.GetStatus(CancellationToken.None);
            ClassicAssert.NotNull(status);
            ClassicAssert.AreEqual(MachineState.Operational, status.State);
            ClassicAssert.AreEqual(287131, status.ElapsedJobTime);
            ClassicAssert.AreEqual(103481, status.EstimatedTimeRemaining);
            ClassicAssert.AreEqual(73.5f, status.Progress);
            ClassicAssert.AreEqual(100f, status.FanSpeed);
            ClassicAssert.AreEqual(100f, status.FeedRate);

            ClassicAssert.AreEqual(1, status.FlowRates.Count);
            ClassicAssert.AreEqual(0, status.FlowRates.First().Key);
            ClassicAssert.AreEqual(100f, status.FlowRates.First().Value);

            ClassicAssert.AreEqual(2, status.Temperatures.Count);
            var bed = status.Temperatures[-1];
            ClassicAssert.IsNotNull(bed);
            ClassicAssert.AreEqual(45.02f, bed.Actual);
            ClassicAssert.AreEqual(45f, bed.Target);
            var hotEnd = status.Temperatures[0];
            ClassicAssert.IsNotNull(hotEnd);
            ClassicAssert.AreEqual(215.21f, hotEnd.Actual);
            ClassicAssert.AreEqual(215f, hotEnd.Target);
        }

        [Test]
        public void ShouldSetToolTemp()
        {
            ClassicAssert.True(ExecuteGCodeTest(() => _provider.SetToolTemperature(0, 200), c => ClassicAssert.AreEqual("M104 P0 S200", c)));
        }

        [Test]
        public void ShouldSetBedTemp()
        {
            ClassicAssert.True(ExecuteGCodeTest(() => _provider.SetBedTemperature(100), c => ClassicAssert.AreEqual("M140 S100", c)));
        }

        [Test]
        public void ShouldSetFlowRate()
        {
            ClassicAssert.True(ExecuteGCodeTest(() => _provider.SetFlowRate(0, 50), c => ClassicAssert.AreEqual("M221 D0 S50", c)));
        }

        [Test]
        public void ShouldSetFeedRate()
        {
            ClassicAssert.True(ExecuteGCodeTest(() => _provider.SetFeedRate(50), c => ClassicAssert.AreEqual("M220 S50", c)));
        }

        [Test]
        public void ShouldSetFanSpeed()
        {
            ClassicAssert.True(ExecuteGCodeTest(() => _provider.SetFanSpeed(50), c => ClassicAssert.AreEqual("M106 S127", c)));
        }

        [Test]
        public void ShouldPausePrint()
        {
            ClassicAssert.True(ExecuteJobTest(() => _provider.PauseJob(), b =>
            {
                ClassicAssert.AreEqual("pause", b["command"].ToString());
                ClassicAssert.AreEqual("pause", b["action"].ToString());
            }));
        }

        [Test]
        public void ShouldResumePrint()
        {
            ClassicAssert.True(ExecuteJobTest(() => _provider.ResumeJob(), b =>
            {
                ClassicAssert.AreEqual("pause", b["command"].ToString());
                ClassicAssert.AreEqual("resume", b["action"].ToString());
            }));
        }

        [Test]
        public void ShouldCancelPrint()
        {
            ClassicAssert.True(ExecuteJobTest(() => _provider.CancelJob(), b =>
            {
                ClassicAssert.AreEqual("cancel", b["command"].ToString());
            }));
        }

        bool ExecuteJobTest(Action act, Action<JObject> assert)
        {
            var callbackExecuted = false;
            _connector
                 .Setup(p => p.Request(
                     It.IsAny<OctoprintMachine>(),
                     It.IsAny<string>(),
                     It.IsAny<string>(),
                     It.IsAny<IEnumerable<(string name, string value)>>(),
                     It.IsAny<object>(),
                     It.IsAny<CancellationToken>()
                 ))
                 .Callback((OctoprintMachine machine, string r, string m, IEnumerable<(string, string)> q, object b, CancellationToken c) =>
                 {  
                     ClassicAssert.AreEqual("api/job", r);
                     ClassicAssert.AreEqual("POST", m);
                     ClassicAssert.NotNull(b);
                     assert(JObject.Parse(JsonConvert.SerializeObject(b)));

                    callbackExecuted = true;
                });

            act();
            return callbackExecuted;
        }

        bool ExecuteGCodeTest(Action act, Action<string> assert)
        {
            var callbackExecuted = false;
            _connector
                .Setup(p => p.Request(
                    It.IsAny<OctoprintMachine>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<IEnumerable<(string name, string value)>>(),
                    It.IsAny<object>(),
                    It.IsAny<CancellationToken>()
                ))
                .Callback((OctoprintMachine machine, string r, string m, IEnumerable<(string, string)> q, object b, CancellationToken c) =>
                {
                    ClassicAssert.AreEqual("api/printer/command", r);
                    ClassicAssert.AreEqual("POST", m);
                    ClassicAssert.NotNull(b);

                    dynamic body = JObject.Parse(JsonConvert.SerializeObject(b));
                    assert(body.command.ToString());

                    callbackExecuted = true;
                });

            act();
            return callbackExecuted;
        }
    }
}
