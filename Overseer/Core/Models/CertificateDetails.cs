using System.Security.Cryptography.X509Certificates;
using Newtonsoft.Json;

namespace Overseer.Core.Models
{
    public class CertificateDetails
    {
        public CertificateDetails() { }

        public CertificateDetails(X509Certificate certificate)
        {
            IssuedTo = certificate.Subject.Replace("CN=", string.Empty);
            IssuedBy = certificate.Issuer.Replace("CN=", string.Empty);
            IssueDate = certificate.GetEffectiveDateString();
            ExpireDate = certificate.GetExpirationDateString();
            Thumbprint = certificate.GetCertHashString()?.ToLower();
        }

        public string IssuedTo { get; set; }

        public string IssuedBy { get; set; }

        public string IssueDate { get; set; }

        public string ExpireDate { get; set; }

        public string Thumbprint { get; set; }

        public override string ToString()
        {
            return JsonConvert.SerializeObject(this, Formatting.Indented);
        }
    }
}