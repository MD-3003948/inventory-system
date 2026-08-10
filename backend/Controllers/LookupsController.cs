using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventorySystem.Api.Data;
using InventorySystem.Api.Dtos;
using InventorySystem.Api.Extensions;

namespace InventorySystem.Api.Controllers;

[ApiController]
[Route("api/lookups")]
[Authorize]
public class LookupsController(AppDbContext db) : ControllerBase
{
    [HttpGet("part-categories")]
    public async Task<ActionResult<IEnumerable<PartCategoryResponse>>> GetPartCategories()
    {
        var orgId = User.GetOrganizationId();
        var categories = await db.PartCategories
            .Where(c => c.OrganizationId == orgId)
            .OrderBy(c => c.Name)
            .Select(c => new PartCategoryResponse(c.Id, c.Name))
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("part-sub-categories")]
    public async Task<ActionResult<IEnumerable<PartSubCategoryResponse>>> GetPartSubCategories([FromQuery] int? categoryId)
    {
        var orgId = User.GetOrganizationId();
        var query = db.PartSubCategories.Where(c => c.OrganizationId == orgId);
        if (categoryId.HasValue)
        {
            query = query.Where(c => c.PartCategoryId == categoryId.Value);
        }

        var subCategories = await query
            .OrderBy(c => c.Name)
            .Select(c => new PartSubCategoryResponse(c.Id, c.Name, c.PartCategoryId))
            .ToListAsync();

        return Ok(subCategories);
    }

    [HttpGet("customer-categories")]
    public async Task<ActionResult<IEnumerable<CustomerCategoryResponse>>> GetCustomerCategories()
    {
        var orgId = User.GetOrganizationId();
        var categories = await db.CustomerCategories
            .Where(c => c.OrganizationId == orgId)
            .OrderBy(c => c.Name)
            .Select(c => new CustomerCategoryResponse(c.Id, c.Name))
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("attribute-templates")]
    public async Task<ActionResult<IEnumerable<AttributeTemplateResponse>>> GetAttributeTemplates()
    {
        var orgId = User.GetOrganizationId();
        var templates = await db.AttributeTemplates
            .Where(t => t.OrganizationId == orgId)
            .OrderBy(t => t.Name)
            .Select(t => new AttributeTemplateResponse(t.Id, t.Name))
            .ToListAsync();

        return Ok(templates);
    }
}
