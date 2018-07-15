using System;
using System.Linq; 
using Nancy;
using Nancy.ModelBinding;
using Overseer.Core;
using Overseer.Core.Models;

namespace Overseer.Modules
{
    public class AuthenticationModule : NancyModule
    {
        public AuthenticationModule(UserManager userManager)
            : base("services/auth")
        {
            Post["/"] = p =>
            {
                var model = this.Bind<UserAuthentication>();

                try
                {
                    return userManager.AuthenticateUser(model.Username, model.Password);
                }
                catch (Exception ex)
                {
                    var response = (Response)ex.Message;
                    response.StatusCode = HttpStatusCode.BadRequest;

                    return response;
                }
            };

            Delete["/logout"] = p =>
            {
                this.RequiresAuthentication();

                var token = Request.Headers["Authorization"].FirstOrDefault();                
                if (string.IsNullOrWhiteSpace(token)) return HttpStatusCode.OK;

                userManager.DeauthenticateUser(token.Replace("Bearer", string.Empty).Trim());
                return HttpStatusCode.OK;
            };

            Post["/logout/{id:int}"] = p =>
            {
                this.RequiresAuthentication();
                return userManager.DeauthenticateUser((int)p.id);
            };
        }
    }
}
