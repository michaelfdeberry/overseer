﻿using Overseer.Server.Models;
using Overseer.Server.Users;

namespace Overseer.Server.Api
{
  public static class UsersApi
  {
    public static RouteGroupBuilder MapUsersApi(this RouteGroupBuilder builder)
    {
      var group = builder.MapGroup("/users");
      group.RequireAuthorization();

      group.MapGet("/", (IUserManager users) => Results.Ok(users.GetUsers()));

      group.MapGet("/{id}", (int id, IUserManager users) => Results.Ok(users.GetUser(id)));

      group
        .MapPost("/", (UserDisplay user, IUserManager users) => Results.Ok(users.CreateUser(user)))
        .RequireAuthorization(AccessLevel.Administrator.ToString());

      group
        .MapPut("/", (UserDisplay user, IUserManager users) => Results.Ok(users.UpdateUser(user)))
        .RequireAuthorization(AccessLevel.Administrator.ToString());

      group
        .MapDelete(
          "/{id}",
          (int id, IUserManager users) =>
          {
            users.DeleteUser(id);
            return Results.Ok();
          }
        )
        .RequireAuthorization(AccessLevel.Administrator.ToString());

      group
        .MapPost("/password", (UserDisplay user, IUserManager users) => Results.Ok(users.ChangePassword(user)))
        .RequireAuthorization(AccessLevel.Administrator.ToString());

      return builder;
    }
  }
}
