using Nancy;
using Nancy.ModelBinding;
using Nancy.Security;
using Overseer.Models;

namespace Overseer.Daemon.Modules
{
    public class UsersModule : NancyModule
    {
        public UsersModule(IUserManager userManager)
            : base("users")
        {
            this.RequiresMSOwinAuthentication();

            Get("/", p => userManager.GetUsers());

            Get("/{id:int}", p => userManager.GetUser(p.id));

            Put("/", p => userManager.CreateUser(this.Bind<UserDisplay>()));

            Post("/", p => userManager.UpdateUser(this.Bind<UserDisplay>()));

            Delete("/{id:int}", p => userManager.DeleteUser(p.id));
        }
    }
}
