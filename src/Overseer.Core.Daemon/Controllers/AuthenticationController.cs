using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Overseer.Models;
using System.Linq;
using System.Net;

namespace Overseer.Daemon.Controllers
{
    [Route("auth")]
    public class AuthenticationController : Controller
    {
        readonly IUserManager _userManager;

        public AuthenticationController(IUserManager userManager)
        {
            _userManager = userManager;
        }

        /// <summary>
        /// This is used to determine if the user is logged in.
        /// </summary>
        /// <returns>OK if logged in, will fail with a Unauthorized response if not</returns>
        [HttpGet]
        [AllowAnonymous]
        public ActionResult<string> IsAuthenticated()
        {
            if (HttpContext.User.Identity.IsAuthenticated) return Ok();

            Response.StatusCode = (int)HttpStatusCode.Unauthorized;
            return $"requiresInitialization={_userManager.RequiresInitialSetup()}";
        }

        /// <summary>
        /// Authenticates a user
        /// </summary>
        [AllowAnonymous]
        [HttpPost("login")]
        public ActionResult<UserDisplay> Login([FromBody]UserDisplay authentication)
        {
            return _userManager.AuthenticateUser(authentication);
        }

        /// <summary>
        /// Logs out a user
        /// </summary>
        [HttpDelete("logout")]
        public ActionResult<UserDisplay> Delete()
        {
            return _userManager.DeauthenticateUser(Request.Headers["Authorization"].FirstOrDefault());
        }

        /// <summary>
        /// Allows a logged in user to log out another user
        /// </summary>
        [HttpPost("logout/{userId}")]
        public ActionResult<UserDisplay> Logout(int userId)
        {
            return _userManager.DeauthenticateUser(userId);
        }

        [HttpPut("setup")]
        [AllowAnonymous]
        public ActionResult<UserDisplay> CreateInitialUser([FromBody]UserDisplay user)
        {
            if (!_userManager.RequiresInitialSetup())
            {
                Response.StatusCode = (int)HttpStatusCode.PreconditionFailed;
                return null;
            }

            return _userManager.CreateUser(user);
        }
    }
}
