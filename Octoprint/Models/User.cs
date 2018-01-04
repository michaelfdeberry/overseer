using System.Collections;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Octoprint.Models
{
    public class UserList : IEnumerable<UserRecord>
    {
        public IReadOnlyList<UserRecord> Users { get; set; }

        public IEnumerator<UserRecord> GetEnumerator()
        {
            return Users.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }

    public class UserRecord
    {
        public string Name { get; set; }

        public bool Active { get; set; }

        public bool User { get; set; }

        public bool Admin { get; set; }

        [JsonProperty("apikey")]
        public string ApiKey { get; set; }

        public Dictionary<string, object> Settings { get; set; }
    }

    public class UserRegistrationRequest
    {
        public string Name { get; set; }

        public string Password { get; set; }

        public bool Active { get; set; }

        public bool Admin { get; set; }
    }
}