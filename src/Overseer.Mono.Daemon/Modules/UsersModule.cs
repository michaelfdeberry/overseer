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

            Get("/", p =>
            {
                this.RequireAdmin();
                return userManager.GetUsers();
            });

            Get("/{id:int}", p => {
                this.RequireAdmin();
                return userManager.GetUser(p.id);
            });

            Put("/", p => 
            {
                this.RequireAdmin();
                return userManager.CreateUser(this.Bind<UserDisplay>());
            });

            Post("/", p =>
            {
                this.RequireAdmin();
                return userManager.UpdateUser(this.Bind<UserDisplay>());
            });

            Delete("/{id:int}", p => 
            {
                this.RequireAdmin();
                return userManager.DeleteUser(p.id);
            });
        }
    }
}
