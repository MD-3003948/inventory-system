namespace InventorySystem.Api.Dtos;

public record DepartmentResponse(int Id, string Name, int UserCount);

public record DepartmentUpsertRequest(string Name);

public record ManagedUserResponse(
    int Id,
    string UserCode,
    string FirstName,
    string LastName,
    string Username,
    int PrivilegeLevel,
    int? DepartmentId,
    string? DepartmentName,
    DateTimeOffset? LastLoginAt,
    DateTimeOffset CreatedAt
);

public record CreateUserRequest(
    string FirstName,
    string LastName,
    string Username,
    string Password,
    int PrivilegeLevel,
    int? DepartmentId
);

public record UpdateUserRequest(
    string FirstName,
    string LastName,
    string Username,
    int PrivilegeLevel,
    int? DepartmentId
);
