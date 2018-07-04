using Overseer.Core.Data;
using Overseer.Core.Models;
using Sodium;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Overseer.Core
{
    public class ConfigurationManager
    {
        readonly IDataContext _context;
        readonly IRepository<User> _users;
        readonly IRepository<Printer> _printers;
        readonly PrinterProviderManager _printerProviderManager;
        readonly MonitoringService _monitoringService; 

        public ConfigurationManager(IDataContext context, PrinterProviderManager printerProviderManager,
            MonitoringService monitoringService)
        {
            _context = context;
            _users = context.GetRepository<User>();
            _printers = context.GetRepository<Printer>(); 
            _printerProviderManager = printerProviderManager;
            _monitoringService = monitoringService;
        }

        public Printer GetPrinter(int id)
        {
            return _printers.GetById(id);
        }

        public IReadOnlyList<Printer> GetPrinters()
        {
            var printers = _printers.GetAll();
            _printerProviderManager.LoadCache(printers);

            return printers;
        }

        public async Task<Printer> CreatePrinter(Printer printer)
        {
            //The printer won't have an id so a temporary provider will be created.
            var provider = _printerProviderManager.GetProvider(printer);

            //load any default configuration that will be retrieved from the printer.
            await provider.LoadConfiguration(printer);
            
            //if the configuration can be update from the printer then create the printer.
            _printers.Create(printer);

            //Use the printers id to cache the provider since the connection is verified.
            _printerProviderManager.CacheProvider(printer.Id, provider);

            return printer;
        }

        public async Task<Printer> UpdatePrinter(Printer printer)
        {
            if (printer.Disabled)
            {
                //if the printer is disabled remove the provider to stop monitoring
                _printerProviderManager.RemoveProvider(printer.Id);
            }
            else
            {
                //update the configuration from the printer on config printer change
                var provider = _printerProviderManager.GetProvider(printer);
                await provider.LoadConfiguration(printer);
            }

            _printers.Update(printer);
            return printer;
        }

        public void DeletePrinter(int printerId)
        {
            _printerProviderManager.RemoveProvider(printerId);
            var printer = _printers.GetById(printerId);
            _printers.Delete(printer);
        }

        public ApplicationSettings GetApplicationSettings()
        {
            return _context.GetApplicationSettings();
        }

        public ApplicationSettings UpdateApplicationSettings(ApplicationSettings settings)
        {
            _context.UpdateApplicationSettings(settings);
            _monitoringService.Update(settings);

            return settings;
        }

        public IReadOnlyList<UserDisplay> GetUsers()
        {
            return _users.GetAll()
                .Select(user => user.ToDisplay())
                .ToList();
        }

        public UserDisplay CreateUser(string username, string password, int? sessionLifetime)
        {
            if(_users.Get(u => u.Username == username) != null) 
                throw new Exception("Username Unavailable");

            var salt = PasswordHash.ScryptGenerateSalt();
            var hash = PasswordHash.ScryptHashBinary(Encoding.UTF8.GetBytes(password), salt);
            var user = new User
            {
                Username = username,
                PasswordSalt = salt,
                PasswordHash = hash,
                SessionLifetime = sessionLifetime
            };
            
            _users.Create(user);

            return user.ToDisplay();
        }

        public void DeleteUser(int userId)
        {
            var user = _users.GetById(userId);
            if (user != null)
            {
                _users.Delete(user);
            }
        }

        public UserDisplay AuthenticateUser(string username, string password)
        {
            var user = _users.Get(u => u.Username.ToLower() == username.ToLower());

            if(user == null)
                throw new Exception("Invalid Username");

            var passwordHash = PasswordHash.ScryptHashBinary(Encoding.UTF8.GetBytes(password), user.PasswordSalt);
            if (PasswordHash.ScryptHashStringVerify(user.PasswordHash, passwordHash))
                throw new Exception("Invalid Password");
            
            if (!string.IsNullOrWhiteSpace(user.Token) && AuthenticateToken(user.Token))            
                return user.ToDisplay(includeToken: true);

            user.Token = Convert.ToBase64String(SodiumCore.GetRandomBytes(8));
            if (user.SessionLifetime.HasValue)
            {
                user.TokenExpiration = DateTime.UtcNow.AddDays(user.SessionLifetime.Value);
            }
            else
            {
                user.TokenExpiration = null;
            }

            _users.Update(user);

            return user.ToDisplay(includeToken: true);
        }

        public bool AuthenticateToken(string token)
        {           
            var settings = GetApplicationSettings();

            //if authentication isn't required just return
            if (!settings.RequiresAuthentication) return true;

            if (string.IsNullOrWhiteSpace(token)) return false;

            token = token.Replace("Bearer", string.Empty).Trim();
            var user = _users.Get(u => u.Token == token);

            //no user or no token, means the user logged out
            if (string.IsNullOrWhiteSpace(user?.Token))
                return false;
            
            //if the user has a configured session lifetime there will be a token expiration date, check if it's valid
            if (user.TokenExpiration.HasValue && user.TokenExpiration.Value < DateTime.UtcNow)
                return false;

            //has a matching token that isn't expired. 
            return true;
        }

        public UserDisplay DeauthenticateUser(string token)
        {
            if (string.IsNullOrWhiteSpace(token)) return null;

            return DeauthenticateUser(_users.Get(u => u.Token == token));
        }

        public UserDisplay DeauthenticateUser(int userId)
        {
            return DeauthenticateUser(_users.GetById(userId));
        }

        UserDisplay DeauthenticateUser(User user)
        {
            if (user == null) return null;

            user.Token = null;
            user.TokenExpiration = null;
            _users.Update(user);

            return user.ToDisplay();
        }

        public UserDisplay UpdateSessionLifetime(int userId, int? sessionLifetime)
        {
            var user = _users.GetById(userId);
            if (user == null) return null;
            
            //forces a new login
            user.Token = null;
            user.TokenExpiration = null;
            user.SessionLifetime = sessionLifetime;
            _users.Update(user);

            return user.ToDisplay();
        }

        public UserDisplay UpdateUser(UserAuthentication user)
        {
            if (string.IsNullOrWhiteSpace(user.Username) && string.IsNullOrWhiteSpace(user.Password))
            {
                return UpdateSessionLifetime(user.Id, user.SessionLifetime);
            }

            //if they are changing the password delete and recreate the user.
            DeleteUser(user.Id);
            return CreateUser(user.Username, user.Password, user.SessionLifetime);
        }
    }
}