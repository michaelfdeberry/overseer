using Overseer.Server.Models;

namespace Overseer.Server.Channels;

public interface ICertificateExceptionChannel : IChannelBase<CertificateDetails>;

public class CertificateExceptionChannel : ChannelBase<CertificateDetails>, ICertificateExceptionChannel { }
