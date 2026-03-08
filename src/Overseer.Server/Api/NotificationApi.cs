using Overseer.Server.Notifications;

namespace Overseer.Server.Api;

public static class NotificationApi
{
  public static RouteGroupBuilder MapNotificationApi(this RouteGroupBuilder builder)
  {
    var group = builder.MapGroup("/notifications").WithTags("Notifications");
    group.RequireAuthorization();

    group.MapGet("/", (INotificationsManager notificationsManager) => Results.Ok(notificationsManager.GetNotifications()));

    group.MapPost(
      "/read",
      (INotificationsManager notificationsManager, List<int> ids) =>
      {
        notificationsManager.MarkAsRead(ids);
        return Results.Ok();
      }
    );

    group.MapDelete(
      "/",
      (INotificationsManager notificationsManager) =>
      {
        notificationsManager.DeleteAll();
        return Results.Ok();
      }
    );

    group.MapDelete(
      "/{id:int}",
      (INotificationsManager notificationsManager, int id) =>
      {
        notificationsManager.Delete(id);
        return Results.Ok();
      }
    );

    return builder;
  }
}
