using Moq;
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
    public class UnitTestRepRapProvider : RepRapFirmwareMachineProvider
    {
        public UnitTestRepRapProvider(RestMachineConnector<RepRapFirmwareMachine> connector, RepRapFirmwareMachine machine)
            : base(connector, machine)
        {
        }

        public Task<(int timeRemaining, float progress)> CalculateProgressPublic(dynamic jobStatus, CancellationToken cancellation)
        {
            return this.CalculateCompletion(jobStatus, cancellation);
        }
    }

    [TestFixture]
    public class RepRapProviderTests
    {
        RepRapFirmwareMachine _machine;
        IMachineProvider _provider; 
        Mock<RestMachineConnector<RepRapFirmwareMachine>> _connector;

        [SetUp]
        public void Setup()
        {
            _machine = new RepRapFirmwareMachine();
            _machine.Name = "UnitTestPrinter2";
            _machine.Url = "http://192.168.1.199/";
            _machine.WebCamUrl = "http://192.168.1.200/stream";
            _machine.SnapshotUrl = "http://192.168.1.200/snapshot";

            _connector = new Mock<RestMachineConnector<RepRapFirmwareMachine>>();
            _provider = new RepRapFirmwareMachineProvider(_connector.Object, _machine);            
        }

        [Test]
        public async Task ShouldLoadConfiguration()
        {
            _connector
                .Setup(p => p.Request(
                    It.IsAny<RepRapFirmwareMachine>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<IEnumerable<(string name, string value)>>(),
                    It.IsAny<object>(),
                    It.IsAny<CancellationToken>()
                ))
                .Returns(Task.FromResult(JObject.Parse(Resources.RepRapFirmwareStatusType2)));

            await _provider.LoadConfiguration(_machine);

            ClassicAssert.AreEqual(3, _machine.Tools.Count());
            var bed = _machine.GetHeater(0);
            ClassicAssert.IsNotNull(bed);
            ClassicAssert.AreEqual("bed", bed.Name);

            var hotend = _machine.GetHeater(1);
            ClassicAssert.IsNotNull(hotend);
            ClassicAssert.AreEqual("Heater 1", hotend.Name);

            var extruder = _machine.GetExtruder(0);
            ClassicAssert.IsNotNull(extruder);
            ClassicAssert.AreEqual("Extruder 0", extruder.Name);
        }

        [Test]
        public void ShouldRethrowOverseerException()
        {
            var exception = new OverseerException("Certificate_Exception");
            try
            {
                _connector
                 .Setup(p => p.Request(
                     It.IsAny<RepRapFirmwareMachine>(),
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
        public void ShouldThrowConnectionFailureError()
        {
            try
            {
                _connector
                 .Setup(p => p.Request(
                     It.IsAny<RepRapFirmwareMachine>(),
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
        public async Task ShouldCalculateProgressUsingFilament()
        {
            _connector
                 .Setup(p => p.Request(
                     It.IsAny<RepRapFirmwareMachine>(),
                     It.IsAny<string>(),
                     It.IsAny<string>(),
                     It.IsAny<IEnumerable<(string name, string value)>>(),
                     It.IsAny<object>(),
                     It.IsAny<CancellationToken>()
                 ))
                 .Returns(Task.FromResult(JObject.Parse(Resources.RepRapFirmwareFileInfoFilament)));

            dynamic printStatus = JObject.Parse(Resources.RepRapFirmwareStatusType3);
            var provider = new UnitTestRepRapProvider(_connector.Object, _machine);
            (int timeLeft, float progress) completion = await provider.CalculateProgressPublic(printStatus, CancellationToken.None);

            ClassicAssert.AreEqual(15192, completion.timeLeft);
            ClassicAssert.AreEqual(10.5f, completion.progress);
        }

        [Test]
        public async Task ShouldCalculateProgressUsingHeight()
        {
            _connector
                 .Setup(p => p.Request(
                     It.IsAny<RepRapFirmwareMachine>(),
                     It.IsAny<string>(),
                     It.IsAny<string>(),
                     It.IsAny<IEnumerable<(string name, string value)>>(),
                     It.IsAny<object>(),
                     It.IsAny<CancellationToken>()
                 ))
                 .Returns(Task.FromResult(JObject.Parse(Resources.RepRapFirmwareFileInfoHeight)));

            dynamic printStatus = JObject.Parse(Resources.RepRapFirmwareStatusType3);
            var provider = new UnitTestRepRapProvider(_connector.Object, _machine);            
            (int timeLeft, float progress) completion = await provider.CalculateProgressPublic(printStatus, CancellationToken.None);

            ClassicAssert.AreEqual(39534, completion.timeLeft);
            ClassicAssert.AreEqual(5f, completion.progress);
        }

        [Test]
        public async Task ShouldCalculateProgressUsingFileProgress()
        {
            _connector
                .Setup(p => p.Request(
                    It.IsAny<RepRapFirmwareMachine>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<IEnumerable<(string name, string value)>>(),
                    It.IsAny<object>(),
                    It.IsAny<CancellationToken>()
                ))
                .Returns(Task.FromResult(JObject.Parse(Resources.RepRapFirmwareFileInfoFile)));

            dynamic printStatus = JObject.Parse(Resources.RepRapFirmwareStatusType3);
            var provider = new UnitTestRepRapProvider(_connector.Object, _machine);
            (int timeLeft, float progress) completion = await provider.CalculateProgressPublic(printStatus, CancellationToken.None);

            ClassicAssert.AreEqual(135850, completion.timeLeft);
            ClassicAssert.AreEqual(1.5f, completion.progress);
        }
        
        [Test]
        public async Task ShouldGetPrinterStatus()
        {
            _connector
                .Setup(p => p.Request(
                    It.IsAny<RepRapFirmwareMachine>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<IEnumerable<(string name, string value)>>(),
                    It.IsAny<object>(),
                    It.IsAny<CancellationToken>()
                ))
                .Returns((RepRapFirmwareMachine machine, string r, string m, IEnumerable<(string, string)> q, object b, CancellationToken c) =>
                {
                    switch (r)
                    {
                        case "rr_status":
                            var type = q.First(x => x.Item1 == "type");
                            switch (type.Item2)
                            {
                                case "2":
                                    return Task.FromResult(JObject.Parse(Resources.RepRapFirmwareStatusType2));
                                case "3":
                                    return Task.FromResult(JObject.Parse(Resources.RepRapFirmwareStatusType3));
                                default:
                                    return Task.FromResult<JObject>(null);
                            }
                        case "rr_fileinfo":
                            return Task.FromResult(JObject.Parse(Resources.RepRapFirmwareFileInfoFilament));
                        default:
                            return Task.FromResult<JObject>(null);
                    }
                });

            await _provider.LoadConfiguration(_machine);
            var status = await _provider.GetStatus(CancellationToken.None);
            ClassicAssert.NotNull(status);
            ClassicAssert.AreEqual(MachineState.Operational, status.State);
            
            ClassicAssert.AreEqual(10.5f, status.Progress);
            ClassicAssert.AreEqual(1788, status.ElapsedJobTime);
            ClassicAssert.AreEqual(15192, status.EstimatedTimeRemaining);
            ClassicAssert.AreEqual(93f, status.FanSpeed);
            ClassicAssert.AreEqual(100f, status.FeedRate);

            ClassicAssert.AreEqual(1, status.FlowRates.Count);
            ClassicAssert.True(status.FlowRates.ContainsKey(0));
            ClassicAssert.AreEqual(100f, status.FlowRates[0]);

            ClassicAssert.AreEqual(2, status.Temperatures.Count);
            var bed = status.Temperatures[0];
            ClassicAssert.AreEqual(59.9f, bed.Actual);
            ClassicAssert.AreEqual(60f, bed.Target);

            var hotEnd = status.Temperatures[1];
            ClassicAssert.AreEqual(215f, hotEnd.Actual);
            ClassicAssert.AreEqual(215f, hotEnd.Target);
        }
    }
}
