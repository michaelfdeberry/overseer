namespace Overseer.Models
{
  public interface IPollingMachine
  {
    string Url { get; set; }

    string ClientCertificate { get; set; }
  }
}