using Overseer.Core.Data;

namespace Overseer.Core.Models
{
    public class CertificateException : CertificateDetails, IEntity
    {
        public int Id { get; set; }
    }
}
