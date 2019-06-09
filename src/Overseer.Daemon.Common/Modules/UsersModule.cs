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
            this.RequiresAuthentication();

            Get("/", p =>
            {
                this.RequiresAdmin();
                return userManager.GetUsers();
            });

            Get("/{id:int}", p => 
            {
                this.RequiresAdmin();
                return userManager.GetUser(p.id);
            });

            Put("/", p => 
            {
                this.RequiresAdmin();
                return userManager.CreateUser(this.Bind<UserDisplay>());
            });

            Post("/", p =>
            {
                this.RequiresAdmin();
                return userManager.UpdateUser(this.Bind<UserDisplay>());
            });

            Delete("/{id:int}", p => 
            {
                this.RequiresAdmin();
                return userManager.DeleteUser(p.id);
            });

            Post("/password", p => 
            {
                this.RequiresAdmin();
                return userManager.ChangePassword(this.Bind<UserDisplay>());
            });
        }
    }
}
