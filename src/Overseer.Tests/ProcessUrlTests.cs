using NUnit.Framework;
using Overseer.Machines.Providers;
using Overseer.Models;
using System;

namespace Overseer.Tests
{
    [TestFixture]
    public class ProcessUrlTests
    {
        [Test]
        public void ShouldReturnValidUri()
        {
            var url = "http://192.168.1.1/";
            var uri = RestMachineConnector<OctoprintMachine>.ProcessUri(url);
            Assert.AreEqual(new Uri(url), uri);
        }

        [Test]
        public void ShouldApplyRef()
        {
            var url = "http://192.168.1.1/";
            var uri = RestMachineConnector<OctoprintMachine>.ProcessUri(url, "/api");
            Assert.AreEqual(new Uri("http://192.168.1.1/api"), uri);
        }

        [Test]
        public void ShouldApplyRefWithQueryString()
        {
            var url = "http://192.168.1.1/";
            var uri = RestMachineConnector<OctoprintMachine>.ProcessUri(url, "/api?test=1");
            Assert.AreEqual(new Uri("http://192.168.1.1/api?test=1"), uri);
        }

        [Test]
        public void ShouldApplyRefWithoutSlash()
        {
            var url = "http://192.168.1.1/";
            var uri = RestMachineConnector<OctoprintMachine>.ProcessUri(url, "api");
            Assert.AreEqual(new Uri("http://192.168.1.1/api"), uri);
        }

        [Test]
        public void ShouldUseAbsoluteRef()
        {
            var url = "http://192.168.1.1/";
            var refPath = "http://192.168.1.2/";
            var uri = RestMachineConnector<OctoprintMachine>.ProcessUri(url, refPath);
            Assert.AreEqual(new Uri(refPath), uri);
        }

        [Test]
        public void ShouldUseRelativePathForLocalHost()
        {
            var url = "http://192.168.1.1/";
            var refPath = "http://localhost/some/path";
            var uri = RestMachineConnector<OctoprintMachine>.ProcessUri(url, refPath);
            Assert.AreEqual(new Uri("http://192.168.1.1/some/path"), uri);
        }

        [Test]
        public void ShouldUseRelativePathForLocalHostWithQuery()
        {
            var url = "http://192.168.1.1/";
            var refPath = "http://localhost/some/path?test=1";
            var uri = RestMachineConnector<OctoprintMachine>.ProcessUri(url, refPath);
            Assert.AreEqual(new Uri("http://192.168.1.1/some/path?test=1"), uri);
        }

        [Test]
        public void ShouldUseRelativePathForLoopback()
        {
            var url = "http://192.168.1.1/";
            var refPath = "http://127.0.0.1/some/path";
            var uri = RestMachineConnector<OctoprintMachine>.ProcessUri(url, refPath);
            Assert.AreEqual(new Uri("http://192.168.1.1/some/path"), uri);
        }
    }
}
