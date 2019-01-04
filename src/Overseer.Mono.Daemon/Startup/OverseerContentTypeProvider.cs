using Microsoft.Owin.StaticFiles.ContentTypes;

namespace Overseer.Daemon.Startup
{
    public class OverseerContentTypeProvider : FileExtensionContentTypeProvider
    {
        public OverseerContentTypeProvider()
        {
            Mappings.Add(".json", "application/json");
        }
    }
}
