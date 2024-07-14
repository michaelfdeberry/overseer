﻿using Moq;
using NUnit.Framework;
using NUnit.Framework.Legacy;
using Overseer.Data;
using Overseer.Machines;
using Overseer.Machines.Providers;
using Overseer.Models;
using Overseer.Tests.Data;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Overseer.Tests
{
    [TestFixture]
    public class MachineProviderManagerTests
    {
        IDataContext _context;
        IRepository<Machine> _machines;

        MachineProviderManager _providerManager;

        public IMachineProvider ProviderFactoryFunction(Machine machine)
        {
            IMachineProvider provider;
            switch (machine.MachineType)
            {
                case MachineType.Octoprint:
                    var oConnectorMock = new Mock<RestMachineConnector<OctoprintMachine>>();
                    provider = new OctoprintMachineProvider(oConnectorMock.Object, machine as OctoprintMachine);
                    break;
                case MachineType.RepRapFirmware:
                    var rrfConnectorMock = new Mock<RestMachineConnector<RepRapFirmwareMachine>>();
                    provider = new RepRapFirmwareMachineProvider(rrfConnectorMock.Object, machine as RepRapFirmwareMachine);
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }

            return provider;
        }

        [SetUp]
        public void SetUpFixture()
        {
            _context = new UnitTestContext();
            _machines = _context.GetRepository<Machine>();
            _providerManager = new MachineProviderManager(ProviderFactoryFunction);
        }

        static Machine ConstructPrinter()
        {
            return new OctoprintMachine
            {
                Name = "UnitTestPrinter",
                Url = "http://octoprint.local",
                ApiKey = Guid.NewGuid().ToString()                
            };
        }

        [Test]
        public void ShouldGetAllProviders()
        {
            var machines = new List<Machine>
            {
                ConstructPrinter(),
                ConstructPrinter(),
                ConstructPrinter()
            };

            //generate ids for the machines
            machines.ForEach(m => _machines.Create(m));

            var providers = _providerManager.GetProviders(machines);
            ClassicAssert.IsNotNull(providers);
            ClassicAssert.IsNotEmpty(providers);
            ClassicAssert.True(machines.Select(m => m.Id).All(id => providers.Any(p => p.MachineId == id)));
        }
                
        [Test]
        public void ShouldGetProviderById()
        {
            var machine = ConstructPrinter();
            _machines.Create(machine);

            var provider = _providerManager.GetProvider(machine);
            ClassicAssert.NotNull(provider);
        }

        [Test]
        public void ShouldFindTypeForEachPrinterType()
        {
            var type = MachineProviderManager.GetProviderType(new OctoprintMachine());
            ClassicAssert.IsNotNull(type);
            ClassicAssert.AreEqual(typeof(OctoprintMachineProvider), type);

            type = MachineProviderManager.GetProviderType(new RepRapFirmwareMachine());
            ClassicAssert.IsNotNull(type);
            ClassicAssert.AreEqual(typeof(RepRapFirmwareMachineProvider), type);

            ClassicAssert.Throws<InvalidOperationException>(() => MachineProviderManager.GetProviderType(new InvalidMachine()));
        }

        [Test]
        public void ShouldGetTypeOfMachineByMachineType()
        {
            var type = Machine.GetMachineType(MachineType.Octoprint.ToString());
            ClassicAssert.AreEqual(typeof(OctoprintMachine), type);

            type = Machine.GetMachineType(MachineType.RepRapFirmware.ToString());
            ClassicAssert.AreEqual(typeof(RepRapFirmwareMachine), type);

            ClassicAssert.Throws<InvalidOperationException>(() => Machine.GetMachineType(MachineType.Unknown.ToString()));
        }

        class InvalidMachine : Machine
        {
            public override MachineType MachineType => MachineType.Unknown;
        }
    }
}
