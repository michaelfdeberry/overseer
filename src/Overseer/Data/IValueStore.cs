namespace Overseer.Data
{
	public interface IValueStore
	{
		/// <summary>
		/// Gets a value where the key is the name of type T
		/// </summary>
		T Get<T>();

		/// <summary>
		/// Gets a value by key
		/// </summary>
		T Get<T>(string key);

		/// <summary>
		/// Stores a value where the key will be the name of type T
		/// </summary>
		/// <remarks>
		/// This is good for singleton type records e.g. application settings
		/// </remarks>
		void Put<T>(T value);

		/// <summary>
		/// Stores a value by key
		/// </summary>
		void Put<T>(string key, T value);
	}
}
