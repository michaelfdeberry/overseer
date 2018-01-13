using Nancy.Extensions;
using Nancy.ModelBinding;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.IO;
using System.Linq;
using System.Reflection;

namespace Overseer.Startup.Json
{
    /// <summary>
    /// Based on code from https://github.com/NancyFx/Nancy.Serialization.JsonNet
    /// </summary>
    public class JsonNetBodyDeserializer : IBodyDeserializer
    {
        readonly JsonSerializer _serializer;
        
        public JsonNetBodyDeserializer()
        {
            _serializer = JsonSerializer.CreateDefault();
        }
        
        public JsonNetBodyDeserializer(JsonSerializer serializer)
        {
            _serializer = serializer;
        }
        
        public bool CanDeserialize(string contentType, BindingContext context)
        {
            return Helpers.IsJsonType(contentType);
        }

        public object Deserialize(string contentType, Stream bodyStream, BindingContext context)
        {
            if (bodyStream.CanSeek)
            {
                bodyStream.Position = 0;
            }

            var deserializedObject =
                this._serializer.Deserialize(new StreamReader(bodyStream), context.DestinationType);

            var properties =
                context.DestinationType.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                    .Select(p => new BindingMemberInfo(p));

            var fields =
                context.DestinationType.GetFields(BindingFlags.Public | BindingFlags.Instance)
                    .Select(f => new BindingMemberInfo(f));

            if (properties.Concat(fields).Except(context.ValidModelBindingMembers).Any())
            {
                return CreateObjectWithBlacklistExcluded(context, deserializedObject);
            }

            return deserializedObject;
        }

        static object ConvertCollection(object items, Type destinationType, BindingContext context)
        {
            var returnCollection = Activator.CreateInstance(destinationType);

            var collectionAddMethod =
                destinationType.GetMethod("Add", BindingFlags.Public | BindingFlags.Instance);

            foreach (var item in (IEnumerable)items)
            {
                collectionAddMethod.Invoke(returnCollection, new[] { item });
            }

            return returnCollection;
        }

        static object CreateObjectWithBlacklistExcluded(BindingContext context, object deserializedObject)
        {
            var returnObject = Activator.CreateInstance(context.DestinationType, true);

            if (context.DestinationType.IsCollection())
            {
                return ConvertCollection(deserializedObject, context.DestinationType, context);
            }

            foreach (var property in context.ValidModelBindingMembers)
            {
                CopyPropertyValue(property, deserializedObject, returnObject);
            }

            return returnObject;
        }

        static void CopyPropertyValue(BindingMemberInfo property, object sourceObject, object destinationObject)
        {
            property.SetValue(destinationObject, property.GetValue(sourceObject));
        }
    }
}
