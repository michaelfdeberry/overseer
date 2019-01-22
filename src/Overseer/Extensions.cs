using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Overseer
{
	public static class Extensions
	{				
		public static void DoNotAwait(this Task task) { }
		
		/// <summary>
		/// Will return all non-abstract class types that are assignable to the base type
		/// that exist within the assembly for that type
		/// </summary>		
		public static IReadOnlyList<Type> GetAssignableTypes(this Type baseType)
		{
			IEnumerable<Type> types;

			try
			{
				types = baseType.Assembly.GetTypes();
			}
			catch (ReflectionTypeLoadException ex)
			{
				types = ex.Types;
			}

			return types
				.Where(type => baseType.IsAssignableFrom(type) && type.IsClass && !type.IsAbstract)
				.ToList();
		}
	}
}
