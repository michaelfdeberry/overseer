using Moq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
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
            _machine.Url = "http://octoprint.local/";
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
            
            Assert.AreEqual("http://octoprint.local/webcam/?action=stream", _machine.WebCamUrl);
            Assert.AreEqual("http://octoprint.local:8080/?action=snapshot", _machine.SnapshotUrl);                                    
            Assert.AreEqual("CR10", _machine.ProfileName);
            Assert.AreEqual(1, _machine.AvailableProfiles.Count);
            Assert.AreEqual(_machine.ProfileName, _machine.AvailableProfiles.First().Value);
            Assert.AreEqual(3, _machine.Tools.Count());            
            Assert.IsNotNull(_machine.GetHeater(-1)); //bed
            Assert.IsNotNull(_machine.GetHeater(0)); //hotend
            Assert.IsNotNull(_machine.GetExtruder(0)); //extruder            
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
                Assert.AreSame(typeof(OverseerException), e.GetType());
                Assert.AreEqual(exception, e);
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
                Assert.AreSame(typeof(OverseerException), e.GetType());
                Assert.AreEqual("octoprint_invalid_key", e.Message);
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
                Assert.AreSame(typeof(OverseerException), e.GetType());
                Assert.AreEqual("printer_connect_failure", e.Message);
            }
        }

        [Test]
        public async Task ShouldGetPrinterStatus()
        {
            await _provider.LoadConfiguration(_machine);
            var status = await _provider.GetStatus(CancellationToken.None);
            Assert.NotNull(status);
            Assert.AreEqual(MachineState.Operational, status.State);
            Assert.AreEqual(287131, status.ElapsedJobTime);
            Assert.AreEqual(103481, status.EstimatedTimeRemaining);
            Assert.AreEqual(73.5f, status.Progress);
            Assert.AreEqual(100f, status.FanSpeed);
            Assert.AreEqual(100f, status.FeedRate);

            Assert.AreEqual(1, status.FlowRates.Count);
            Assert.AreEqual(0, status.FlowRates.First().Key);
            Assert.AreEqual(100f, status.FlowRates.First().Value);

            Assert.AreEqual(2, status.Temperatures.Count);
            var bed = status.Temperatures[-1];
            Assert.IsNotNull(bed);
            Assert.AreEqual(45.02f, bed.Actual);
            Assert.AreEqual(45f, bed.Target);
            var hotEnd = status.Temperatures[0];
            Assert.IsNotNull(hotEnd);
            Assert.AreEqual(215.21f, hotEnd.Actual);
            Assert.AreEqual(215f, hotEnd.Target);
        }

        [Test]
        public void ShouldSetToolTemp()
        {
            Assert.True(ExecuteGCodeTest(() => _provider.SetToolTemperature(0, 200), c => Assert.AreEqual("M104 P0 S200", c)));
        }

        [Test]
        public void ShouldSetBedTemp()
        {
            Assert.True(ExecuteGCodeTest(() => _provider.SetBedTemperature(100), c => Assert.AreEqual("M140 S100", c)));
        }

        [Test]
        public void ShouldSetFlowRate()
        {
            Assert.True(ExecuteGCodeTest(() => _provider.SetFlowRate(0, 50), c => Assert.AreEqual("M221 D0 S50", c)));
        }

        [Test]
        public void ShouldSetFeedRate()
        {
            Assert.True(ExecuteGCodeTest(() => _provider.SetFeedRate(50), c => Assert.AreEqual("M220 S50", c)));
        }

        [Test]
        public void ShouldSetFanSpeed()
        {
            Assert.True(ExecuteGCodeTest(() => _provider.SetFanSpeed(50), c => Assert.AreEqual("M106 S127", c)));
        }

        [Test]
        public void ShouldPausePrint()
        {
            Assert.True(ExecuteJobTest(() => _provider.PauseJob(), b =>
            {
                Assert.AreEqual("pause", b["command"].ToString());
                Assert.AreEqual("pause", b["action"].ToString());
            }));
        }

        [Test]
        public void ShouldResumePrint()
        {
            Assert.True(ExecuteJobTest(() => _provider.ResumeJob(), b =>
            {
                Assert.AreEqual("pause", b["command"].ToString());
                Assert.AreEqual("resume", b["action"].ToString());
            }));
        }

        [Test]
        public void ShouldCancelPrint()
        {
            Assert.True(ExecuteJobTest(() => _provider.CancelJob(), b =>
            {
                Assert.AreEqual("cancel", b["command"].ToString());
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
                    Assert.AreEqual("api/job", r);
                    Assert.AreEqual("POST", m);
                    Assert.NotNull(b);
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
                    Assert.AreEqual("api/printer/command", r);
                    Assert.AreEqual("POST", m);
                    Assert.NotNull(b);

                    dynamic body = JObject.Parse(JsonConvert.SerializeObject(b));
                    assert(body.command.ToString());

                    callbackExecuted = true;
                });

            act();
            return callbackExecuted;
        }
    }
}
