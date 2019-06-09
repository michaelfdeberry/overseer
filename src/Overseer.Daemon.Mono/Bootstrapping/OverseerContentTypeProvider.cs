using Microsoft.Owin.StaticFiles.ContentTypes;

namespace Overseer.Daemon.Bootstrapping
{
    public class OverseerContentTypeProvider : FileExtensionContentTypeProvider
    {
        public OverseerContentTypeProvider()
        {
            Mappings.Add(".json", "application/json");
        }
    }
}
