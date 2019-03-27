using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Overseer.Models;
using System.Collections.Generic;
using System.Linq;

namespace Overseer.Daemon.Controllers
{
    [Route("[controller]")]
    public class UsersController : Controller
    {
        readonly IUserManager _userManager;

        public UsersController(IUserManager userManager)
        {
            _userManager = userManager;
        }

        [HttpGet]
        [Authorize(Roles = "Administrator")]
        public ActionResult<List<UserDisplay>> GetUsers()
        {
            return _userManager.GetUsers().ToList();
        }

        [HttpGet("{userId}")]
        [Authorize(Roles = "Administrator")]
        public ActionResult<UserDisplay> GetUser(int userId)
        {
            return _userManager.GetUser(userId);
        }

        [HttpPut]
        [Authorize(Roles = "Administrator")]
        public ActionResult<UserDisplay> CreateUser([FromBody]UserDisplay user)
        {
            return _userManager.CreateUser(user);
        }

        [HttpPost]
        [Authorize(Roles = "Administrator")]
        public ActionResult<UserDisplay> UpdateUser([FromBody]UserDisplay user)
        {
            return _userManager.UpdateUser(user);
        }
        
        [HttpDelete("{userId}")]
        [Authorize(Roles = "Administrator")]
        public ActionResult DeleteUser(int userId)
        {
            _userManager.DeleteUser(userId);
            return Ok();
        }

        [HttpPost("password")]
        [Authorize(Roles = "Administrator")]
        public ActionResult<UserDisplay> ChangePassword([FromBody]UserDisplay user)
        {
            return _userManager.ChangePassword(user);
        }
    }
}
