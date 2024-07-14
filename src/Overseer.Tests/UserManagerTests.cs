using NUnit.Framework;
using NUnit.Framework.Legacy;
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
            var ex = ClassicAssert.Throws<OverseerException>(() => _userManager.CreateUser(new UserDisplay
            {
                Password = Password
            }));
            ClassicAssert.AreEqual("invalid_username", ex.Message);
        }

        [Test]
        public void ShouldFailToCreateUserWithoutPassword()
        {
            var ex = ClassicAssert.Throws<OverseerException>(() => _userManager.CreateUser(new UserDisplay
            {
                Username = Username
            }));
            ClassicAssert.AreEqual("invalid_password", ex.Message);
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

            ClassicAssert.NotNull(userDisplay);
            ClassicAssert.AreEqual(Username, userDisplay.Username);
            ClassicAssert.AreNotEqual(0, userDisplay.Id);
            ClassicAssert.Null(userDisplay.Token);
            ClassicAssert.False(userDisplay.IsLoggedIn);
            ClassicAssert.AreEqual(7, userDisplay.SessionLifetime);            

            var createdUser = _users.GetById(userDisplay.Id);
            ClassicAssert.NotNull(createdUser);
            ClassicAssert.AreEqual(userDisplay.Username, createdUser.Username);
            ClassicAssert.NotNull(createdUser.PasswordSalt);
            ClassicAssert.NotNull(createdUser.PasswordHash);
            ClassicAssert.AreEqual(userDisplay.SessionLifetime, createdUser.SessionLifetime);
            ClassicAssert.Null(createdUser.Token);
            ClassicAssert.Null(createdUser.TokenExpiration);
        }

        [Test]
        public void ShouldFailToCreateUserWithDuplicateUsername()
        {
            _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password
            });
            var ex = ClassicAssert.Throws<OverseerException>(() => _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password,
                SessionLifetime = 7
            }));
            ClassicAssert.AreEqual("unavailable_username", ex.Message);
        }

        [Test]
        public void ShouldFailToAuthenticateIfUserNotFound()
        {
            _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password
            });

            var ex = ClassicAssert.Throws<OverseerException>(() => _authenticationManager.AuthenticateUser("FakeName", Password));
            ClassicAssert.AreEqual("invalid_username", ex.Message);
        }

        [Test]
        public void ShouldFailToAuthenticateIfPasswordIsIncorrect()
        {
            _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password
            });

            var ex = ClassicAssert.Throws<OverseerException>(() => _authenticationManager.AuthenticateUser(Username, "WrongPassword"));
            ClassicAssert.AreEqual("invalid_password", ex.Message);
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
            ClassicAssert.NotNull(createdUser);

            var authenticatedUser = _authenticationManager.AuthenticateUser(Username, Password);
            ClassicAssert.NotNull(authenticatedUser);
            ClassicAssert.AreEqual(createdUser.Id, authenticatedUser.Id);
            ClassicAssert.NotNull(authenticatedUser.Token);
            ClassicAssert.NotNull(authenticatedUser.SessionLifetime);
            ClassicAssert.AreEqual(7, authenticatedUser.SessionLifetime);
        }

        [Test]
        public void ShouldAuthenticateUserWithNonExpiringSession()
        {
            var createdUser = _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password
            });
            ClassicAssert.NotNull(createdUser);

            var authenticatedUser = _authenticationManager.AuthenticateUser(Username, Password);
            ClassicAssert.NotNull(authenticatedUser);
            ClassicAssert.AreEqual(createdUser.Id, authenticatedUser.Id);
            ClassicAssert.NotNull(authenticatedUser.Token);
            ClassicAssert.Null(authenticatedUser.SessionLifetime);
        }

        [Test]
        public void ShouldUseExistingSessionTokenForNewLogin()
        {
            _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password,
                SessionLifetime = 7
            });

            var session1 = _authenticationManager.AuthenticateUser(Username, Password);
            var session2 = _authenticationManager.AuthenticateUser(Username, Password);
            ClassicAssert.AreEqual(session1.Token, session2.Token);
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
            ClassicAssert.NotNull(tokenAuthedUser);
            ClassicAssert.AreEqual(passwordAuthedUser.Token, tokenAuthedUser.Token);
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
            ClassicAssert.NotNull(tokenAuthedUser);
            ClassicAssert.AreEqual(passwordAuthedUser.Token, tokenAuthedUser.Token);
        }

        [Test]
        public void ShouldFailToAuthenticateInvalidToken()
        {
            ClassicAssert.Null(_authenticationManager.AuthenticateToken(null));
            ClassicAssert.Null(_authenticationManager.AuthenticateToken(string.Empty));
            ClassicAssert.Null(_authenticationManager.AuthenticateToken("Invalid"));
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
            ClassicAssert.Null(tokenAuthedUser);
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
            ClassicAssert.True(session.IsLoggedIn);

            session = _authenticationManager.DeauthenticateUser(session.Token);
            ClassicAssert.False(session.IsLoggedIn);
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
            ClassicAssert.True(session.IsLoggedIn);

            session = _authenticationManager.DeauthenticateUser(session.Id);
            ClassicAssert.False(session.IsLoggedIn);
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
            ClassicAssert.IsNotEmpty(users);
            ClassicAssert.AreEqual(10, users.Count);

            var userDisplays = _userManager.GetUsers();
            ClassicAssert.IsNotEmpty(userDisplays);
            ClassicAssert.AreEqual(users.Count, userDisplays.Count);
            ClassicAssert.True(users.All(x => userDisplays.Any(u => u.Id == x.Id)));
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

            ClassicAssert.NotNull(user2);
            ClassicAssert.AreEqual(user1.Id, user2.Id);
        }

        [Test]
        public void ShouldFailToGetUserById()
        {
            ClassicAssert.Throws<NullReferenceException>(() => _userManager.GetUser(100));
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
            ClassicAssert.NotNull(user);
            ClassicAssert.Throws<OverseerException>(() => _userManager.DeleteUser(user.Id));
        }

        [Test]
        public void ShouldChangePasswordUser()
        {
            _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = "Password1",
                SessionLifetime = 7
            });

            var first = _users.GetById(1);
            ClassicAssert.NotNull(first);
            ClassicAssert.NotNull(_authenticationManager.AuthenticateUser(Username, "Password1"));

            _userManager.ChangePassword(new UserDisplay
            {
                Id = first.Id,
                Username = Username,
                Password = "Password2"
            });
            var second = _users.GetById(1);
            ClassicAssert.NotNull(second);            
            ClassicAssert.NotNull(_authenticationManager.AuthenticateUser(Username, "Password2"));
            ClassicAssert.Throws<OverseerException>(() => _authenticationManager.AuthenticateUser(Username, "Password1"));
        }

        [Test]
        public void ShouldChangeSessionDuration()
        {
            var user = _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password
            });
            ClassicAssert.IsNull(user.SessionLifetime);

            user.SessionLifetime = 7;
            user = _userManager.UpdateUser(user);            
            ClassicAssert.AreEqual(7, user.SessionLifetime);

            var userModel = _users.GetById(user.Id);
            ClassicAssert.AreEqual(user.SessionLifetime, userModel.SessionLifetime);
        }

        [Test]
        public void ShouldGeneratePreauthenticatedToken()
        {
            var user = _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password,
                AccessLevel = AccessLevel.Readonly,
                SessionLifetime = 1
            });

            var ssoToken = _authenticationManager.GetPreauthenticatedToken(user.Id);
            var dbUser = _users.GetById(user.Id);

            ClassicAssert.IsNotNull(dbUser.PreauthenticatedToken);
            ClassicAssert.IsNotNull(dbUser.PreauthenticatedTokenExpiration);
            ClassicAssert.AreEqual(ssoToken, dbUser.PreauthenticatedToken);
            ClassicAssert.IsTrue(DateTime.UtcNow.AddMinutes(2) > dbUser.PreauthenticatedTokenExpiration);
        }

        [Test]
        public void ShouldFailtToGeneratePreauthenticatedToken()
        {
            var user = _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password,
                AccessLevel = AccessLevel.Administrator
            });
            var ssoToken = _authenticationManager.GetPreauthenticatedToken(user.Id);
            ClassicAssert.IsTrue(string.IsNullOrWhiteSpace(ssoToken));
        }

        [Test]
        public void ShouldValidatedPreauthenticatedToken()
        {
            var user = _userManager.CreateUser(new UserDisplay
            {
                Username = Username,
                Password = Password,
                AccessLevel = AccessLevel.Readonly,
                SessionLifetime = 1
            });
            var ssoToken = _authenticationManager.GetPreauthenticatedToken(user.Id);            
            var ssoAuthedUser = _authenticationManager.ValidatePreauthenticatedToken(ssoToken);
            var tokenAuthedUser = _authenticationManager.AuthenticateToken(ssoAuthedUser.Token);
            var dbUser = _users.GetById(ssoAuthedUser.Id);            
            ClassicAssert.NotNull(tokenAuthedUser);
            ClassicAssert.AreEqual(ssoAuthedUser.Token, tokenAuthedUser.Token);
            ClassicAssert.IsNull(dbUser.PreauthenticatedToken);
            ClassicAssert.IsNull(dbUser.PreauthenticatedTokenExpiration);
        }
    }
}
