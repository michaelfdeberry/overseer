using log4net;
using Overseer.Models;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Security;

namespace Overseer
{
	public class CertificateExceptionHandler
	{
		static readonly ILog Log = LogManager.GetLogger(typeof(CertificateExceptionHandler));

		readonly HashSet<string> _exclusions = new HashSet<string>();

		readonly IConfigurationManager _configurationManager;

		public CertificateExceptionHandler(IConfigurationManager configurationManager)
		{
			_configurationManager = configurationManager;
		}
		
		public void Initialize()
		{			
			var exclusions = _configurationManager.GetExcludedCertificates();
			exclusions.ToList().ForEach(c => _exclusions.Add(c.Thumbprint));

			_configurationManager.CertificateExclusionCreated += (sender, args) =>
			{
				_exclusions.Add(args.Data.Thumbprint);
			};

			ServicePointManager.ServerCertificateValidationCallback += (sender, certificate, change, errors) =>
			{
				if (errors == SslPolicyErrors.None) return true;
				if (_exclusions.Contains(certificate.GetCertHashString()?.ToLower())) return true;

				throw new OverseerException("certificate_exception", new CertificateDetails(certificate));
			};
		}
	}
}
