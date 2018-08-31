using System;
using System.Linq; 
using Nancy;
using Nancy.ModelBinding;
using Nancy.Security;
using Overseer.Core;
using Overseer.Core.Models;

namespace Overseer.Modules
{
    public class AuthenticationModule : NancyModule
    {
        public AuthenticationModule(UserManager userManager)
            : base("auth")
        {
            Get["/"] = p =>
            {
                this.RequiresMSOwinAuthentication();
                return HttpStatusCode.OK;
            };

            Post["/login"] = p =>
            {
                var model = this.Bind<UserAuthentication>();
                return userManager.AuthenticateUser(model.Username, model.Password);
            };

            Delete["/logout"] = p =>
            {
                this.RequiresMSOwinAuthentication();

                var token = Request.Headers["Authorization"].FirstOrDefault();                
                if (string.IsNullOrWhiteSpace(token)) return HttpStatusCode.OK;

                userManager.DeauthenticateUser(token.Replace("Bearer", string.Empty).Trim());
                return HttpStatusCode.OK;
            };

            Post["/logout/{id:int}"] = p =>
            {
                this.RequiresMSOwinAuthentication();
                return userManager.DeauthenticateUser((int)p.id);
            };
        }
    }
}
