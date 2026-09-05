using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace InventorySystem.Api.Filters;

// Marks an action as reachable even while the caller's must_change_password
// claim is set - used only by the endpoints needed to actually change the
// password (and to read who you are) while gated.
[AttributeUsage(AttributeTargets.Method)]
public class AllowPendingPasswordChangeAttribute : Attribute
{
}

// Blocks every other authenticated endpoint whenever the caller's token carries
// must_change_password=true, so the forced-reset flow can't be bypassed by
// calling the API directly instead of going through the frontend gate.
public class RequirePasswordChangeFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var isExempt = context.ActionDescriptor.EndpointMetadata.OfType<AllowPendingPasswordChangeAttribute>().Any();
        var mustChangeClaim = context.HttpContext.User.FindFirst("must_change_password")?.Value;

        if (!isExempt && bool.TryParse(mustChangeClaim, out var mustChange) && mustChange)
        {
            context.Result = new ObjectResult("Password change required.")
            {
                StatusCode = StatusCodes.Status403Forbidden,
            };
            return;
        }

        await next();
    }
}
