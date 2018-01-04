using Microsoft.Owin.StaticFiles.ContentTypes;

namespace Overseer.Startup
{
    public class OverseerContentTypeProvider : FileExtensionContentTypeProvider
    {
        public OverseerContentTypeProvider()
        {
            Mappings.Add(".json", "application/json");
        }
    }
}
