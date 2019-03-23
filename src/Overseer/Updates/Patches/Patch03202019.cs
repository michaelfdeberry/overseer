using Overseer.Data;
using Overseer.Models;
using System;
using System.Linq;

namespace Overseer.Updates.Patches
{
    public class Patch03202019 : IPatch
    {
        public Version Version { get; } = new Version(1, 0, 3, 1);

        public void Execute(LiteDataContext context)
        {
            //Default existing users to admins
            var usersRepository = context.GetRepository<User>();
            var users = usersRepository.GetAll().ToList();
            users.ForEach(u => u.AccessLevel = AccessLevel.Administrator);
            usersRepository.Update(users);
        }
    }
}
