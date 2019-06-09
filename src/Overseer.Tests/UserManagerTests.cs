using NUnit.Framework;
using Overseer.Data;
using Overseer.Models;
using Overseer.Tests.Data;
using System;
using System.Linq;

namespace Overseer.Tests
{
    [TestFixture]
    public class UserManagerTests
    {
        const string Username = "UnitTestUser";
        const string Password = "UnitTestPassword";

        UserManager _userManager;
        AuthenticationManager _authenticationManager;
        AuthorizationManager _authorizationManager;

        IDataContext _context;
        IRepository<User> _users;

        [SetUp]
        public void Setup()
        {
            _context = new UnitTestContext();
            _users = _context.GetRepository<User>();
            _userManager = new UserManager(_context);
            _authenticationManager = new AuthenticationManager(_context);
            _authorizationManager = new AuthorizationManager(_context, _authenticationManager);
        }

        [Test]
        public void ShouldFailToCreateUserWithoutUsername()
        {
            var ex = Assert.Throws<OverseerException>(() => _userManager.CreateUser(new UserDisplay
            {
                Password = Password
            }));
            Assert.AreEqual("invalid_username", ex.Message);
        }

        [Test]
        public void ShouldFailToCreateUserWithoutPassword()
        {
            var ex = Assert.Throws<OverseerException>(() => _userManager.CreateUser(new UserDisplay
            {
                Username = Username
            }));
            Assert.AreEqual("invalid_password", ex.Message);
        }

        [Test]
        public void ShouldCreateUser()
        {
            var userDisplay = _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password,
                SessionLifetime = 7
            });

            Assert.NotNull(userDisplay);
            Assert.AreEqual(Username, userDisplay.Username);
            Assert.AreNotEqual(0, userDisplay.Id);
            Assert.Null(userDisplay.Token);
            Assert.False(userDisplay.IsLoggedIn);
            Assert.AreEqual(7, userDisplay.SessionLifetime);            

            var createdUser = _users.GetById(userDisplay.Id);
            Assert.NotNull(createdUser);
            Assert.AreEqual(userDisplay.Username, createdUser.Username);
            Assert.NotNull(createdUser.PasswordSalt);
            Assert.NotNull(createdUser.PasswordHash);
            Assert.AreEqual(userDisplay.SessionLifetime, createdUser.SessionLifetime);
            Assert.Null(createdUser.Token);
            Assert.Null(createdUser.TokenExpiration);
        }

        [Test]
        public void ShouldFailToCreateUserWithDuplicateUsername()
        {
            _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password
            });
            var ex = Assert.Throws<OverseerException>(() => _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password,
                SessionLifetime = 7
            }));
            Assert.AreEqual("unavailable_username", ex.Message);
        }

        [Test]
        public void ShouldFailToAuthenticateIfUserNotFound()
        {
            _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password
            });

            var ex = Assert.Throws<OverseerException>(() => _authenticationManager.AuthenticateUser("FakeName", Password));
            Assert.AreEqual("invalid_username", ex.Message);
        }

        [Test]
        public void ShouldFailToAuthenticateIfPasswordIsIncorrect()
        {
            _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password
            });

            var ex = Assert.Throws<OverseerException>(() => _authenticationManager.AuthenticateUser(Username, "WrongPassword"));
            Assert.AreEqual("invalid_password", ex.Message);
        }

        [Test]
        public void ShouldAuthenticateUserWithExpiringSession()
        {
            var createdUser = _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password,
                SessionLifetime = 7
            });
            Assert.NotNull(createdUser);

            var authenticatedUser = _authenticationManager.AuthenticateUser(Username, Password);
            Assert.NotNull(authenticatedUser);
            Assert.AreEqual(createdUser.Id, authenticatedUser.Id);
            Assert.NotNull(authenticatedUser.Token);
            Assert.NotNull(authenticatedUser.SessionLifetime);
            Assert.AreEqual(7, authenticatedUser.SessionLifetime);
        }

        [Test]
        public void ShouldAuthenticateUserWithNonExpiringSession()
        {
            var createdUser = _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password
            });
            Assert.NotNull(createdUser);

            var authenticatedUser = _authenticationManager.AuthenticateUser(Username, Password);
            Assert.NotNull(authenticatedUser);
            Assert.AreEqual(createdUser.Id, authenticatedUser.Id);
            Assert.NotNull(authenticatedUser.Token);
            Assert.Null(authenticatedUser.SessionLifetime);
        }

        [Test]
        public void ShouldUseExistingSessionTokenForNewSession()
        {
            _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password,
                SessionLifetime = 7
            });

            var session1 = _authenticationManager.AuthenticateUser(Username, Password);
            var session2 = _authenticationManager.AuthenticateUser(Username, Password);
            Assert.AreEqual(session1.Token, session2.Token);
        }
        
        [Test]
        public void ShouldAuthenticateIfRequiresAuthenticationIsEnabled()
        {
            _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password, 
                SessionLifetime = 7
            });
            var session = _authenticationManager.AuthenticateUser(Username, Password);
            
            Assert.IsNotNull(_authenticationManager.AuthenticateToken(session.Token));
        }
        
        [Test]
        public void ShouldAuthenticateTokenWithExpiration()
        {
            _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password,
                SessionLifetime = 7
            });
            var passwordAuthedUser = _authenticationManager.AuthenticateUser(Username, Password);
            var tokenAuthedUser = _authenticationManager.AuthenticateToken(passwordAuthedUser.Token);
            Assert.NotNull(tokenAuthedUser);
            Assert.AreEqual(passwordAuthedUser.Token, tokenAuthedUser.Token);
        }

        [Test]
        public void ShouldAuthenticateTokenWithoutExpiration()
        {
            _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password
            });
            var passwordAuthedUser = _authenticationManager.AuthenticateUser(Username, Password);
            var tokenAuthedUser = _authenticationManager.AuthenticateToken(passwordAuthedUser.Token);
            Assert.NotNull(tokenAuthedUser);
            Assert.AreEqual(passwordAuthedUser.Token, tokenAuthedUser.Token);
        }

        [Test]
        public void ShouldFailToAuthenticateInvalidToken()
        {
            Assert.Null(_authenticationManager.AuthenticateToken(null));
            Assert.Null(_authenticationManager.AuthenticateToken(string.Empty));
            Assert.Null(_authenticationManager.AuthenticateToken("Invalid"));
        }

        [Test]
        public void ShouldFailToAuthenticateExpiredToken()
        {
            _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password,
                SessionLifetime = 7
            });
            var passwordAuthedUser = _authenticationManager.AuthenticateUser(Username, Password);

            var user = _users.GetById(passwordAuthedUser.Id);
            user.TokenExpiration = DateTime.Now.Subtract(TimeSpan.FromDays(8));
            _users.Update(user);

            var tokenAuthedUser = _authenticationManager.AuthenticateToken(passwordAuthedUser.Token);
            Assert.Null(tokenAuthedUser);
        }

        [Test]
        public void ShouldDeauthenticateUserByToken()
        {
            _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password,
                SessionLifetime = 7
            });
            var session = _authenticationManager.AuthenticateUser(Username, Password);
            Assert.True(session.IsLoggedIn);

            session = _authenticationManager.DeauthenticateUser(session.Token);
            Assert.False(session.IsLoggedIn);
        }

        [Test]
        public void ShouldDeauthenticateUserById()
        {
            _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password,
                SessionLifetime = 7
            });
            var session = _authenticationManager.AuthenticateUser(Username, Password);
            Assert.True(session.IsLoggedIn);

            session = _authenticationManager.DeauthenticateUser(session.Id);
            Assert.False(session.IsLoggedIn);
        }

        [Test]
        public void ShouldGetAllUsers()
        {
            for (var i = 0; i < 10; i++)
            {
                _userManager.CreateUser(new UserDisplay
                {
                    Username = Username + i,
                    Password = Password
                });
            }

            var users = _users.GetAll();
            Assert.IsNotEmpty(users);
            Assert.AreEqual(10, users.Count);

            var userDisplays = _userManager.GetUsers();
            Assert.IsNotEmpty(userDisplays);
            Assert.AreEqual(users.Count, userDisplays.Count);
            Assert.True(users.All(x => userDisplays.Any(u => u.Id == x.Id)));
        }

        [Test]
        public void ShouldGetUserById()
        {
            var user1 = _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password,
                SessionLifetime = 7
            });

            var user2 = _userManager.GetUser(user1.Id);

            Assert.NotNull(user2);
            Assert.AreEqual(user1.Id, user2.Id);
        }

        [Test]
        public void ShouldFailToGetUserById()
        {
            Assert.Throws<NullReferenceException>(() => _userManager.GetUser(100));
        }

        [Test]
        public void ShouldNotAllowDeletionOfLastUser()
        {
            _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = "Password1",
                SessionLifetime = 7
            });

            var user = _users.GetById(1);
            Assert.NotNull(user);
            Assert.Throws<OverseerException>(() => _userManager.DeleteUser(user.Id));
        }

        [Test]
        public void ShouldChangePasswordByRecreatingUser()
        {
            _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = "Password1",
                SessionLifetime = 7
            });

            var first = _users.GetById(1);
            Assert.NotNull(first);
            Assert.NotNull(_authenticationManager.AuthenticateUser(Username, "Password1"));

            _userManager.UpdateUser(new UserDisplay
            {
                Id = first.Id,
                Username = Username,
                Password = "Password2"
            });
            var second = _users.GetById(1);
            Assert.NotNull(second);            
            Assert.NotNull(_authenticationManager.AuthenticateUser(Username, "Password2"));
            Assert.Throws<OverseerException>(() => _authenticationManager.AuthenticateUser(Username, "Password1"));
        }

        [Test]
        public void ShouldChangeSessionDuration()
        {
            var user = _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password
            });
            Assert.IsNull(user.SessionLifetime);

            user.SessionLifetime = 7;
            user = _userManager.UpdateUser(user);            
            Assert.AreEqual(7, user.SessionLifetime);

            var userModel = _users.GetById(user.Id);
            Assert.AreEqual(user.SessionLifetime, userModel.SessionLifetime);
        }
    }
}
