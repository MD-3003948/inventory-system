using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventorySystem.Api.Data;
using InventorySystem.Api.Dtos;
using InventorySystem.Api.Extensions;
using InventorySystem.Api.Models;

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

    [HttpPost("part-categories")]
    public async Task<ActionResult<PartCategoryResponse>> CreatePartCategory(PartCategoryUpsertRequest request)
    {
        var orgId = User.GetOrganizationId();
        var category = new PartCategory { Name = request.Name, OrganizationId = orgId };
        db.PartCategories.Add(category);
        await db.SaveChangesAsync();

        return Ok(new PartCategoryResponse(category.Id, category.Name));
    }

    [HttpPut("part-categories/{id:int}")]
    public async Task<ActionResult<PartCategoryResponse>> UpdatePartCategory(int id, PartCategoryUpsertRequest request)
    {
        var orgId = User.GetOrganizationId();
        var category = await db.PartCategories.FirstOrDefaultAsync(c => c.Id == id && c.OrganizationId == orgId);
        if (category is null) return NotFound();

        category.Name = request.Name;
        await db.SaveChangesAsync();

        return Ok(new PartCategoryResponse(category.Id, category.Name));
    }

    [HttpDelete("part-categories/{id:int}")]
    public async Task<IActionResult> DeletePartCategory(int id)
    {
        var orgId = User.GetOrganizationId();
        var category = await db.PartCategories.FirstOrDefaultAsync(c => c.Id == id && c.OrganizationId == orgId);
        if (category is null) return NotFound();

        db.PartCategories.Remove(category);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return BadRequest("Cannot delete: this category (or one of its sub-categories) is still in use by a product.");
        }

        return NoContent();
    }

    [HttpPost("part-sub-categories")]
    public async Task<ActionResult<PartSubCategoryResponse>> CreatePartSubCategory(PartSubCategoryUpsertRequest request)
    {
        var orgId = User.GetOrganizationId();
        var categoryOk = await db.PartCategories.AnyAsync(c => c.Id == request.PartCategoryId && c.OrganizationId == orgId);
        if (!categoryOk) return BadRequest("Invalid part category.");

        var subCategory = new PartSubCategory
        {
            Name = request.Name,
            PartCategoryId = request.PartCategoryId,
            OrganizationId = orgId,
        };
        db.PartSubCategories.Add(subCategory);
        await db.SaveChangesAsync();

        return Ok(new PartSubCategoryResponse(subCategory.Id, subCategory.Name, subCategory.PartCategoryId));
    }

    [HttpPut("part-sub-categories/{id:int}")]
    public async Task<ActionResult<PartSubCategoryResponse>> UpdatePartSubCategory(int id, PartSubCategoryUpsertRequest request)
    {
        var orgId = User.GetOrganizationId();
        var subCategory = await db.PartSubCategories.FirstOrDefaultAsync(c => c.Id == id && c.OrganizationId == orgId);
        if (subCategory is null) return NotFound();

        var categoryOk = await db.PartCategories.AnyAsync(c => c.Id == request.PartCategoryId && c.OrganizationId == orgId);
        if (!categoryOk) return BadRequest("Invalid part category.");

        subCategory.Name = request.Name;
        subCategory.PartCategoryId = request.PartCategoryId;
        await db.SaveChangesAsync();

        return Ok(new PartSubCategoryResponse(subCategory.Id, subCategory.Name, subCategory.PartCategoryId));
    }

    [HttpDelete("part-sub-categories/{id:int}")]
    public async Task<IActionResult> DeletePartSubCategory(int id)
    {
        var orgId = User.GetOrganizationId();
        var subCategory = await db.PartSubCategories.FirstOrDefaultAsync(c => c.Id == id && c.OrganizationId == orgId);
        if (subCategory is null) return NotFound();

        db.PartSubCategories.Remove(subCategory);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return BadRequest("Cannot delete: this sub-category is still in use by a product.");
        }

        return NoContent();
    }

    [HttpPost("attribute-templates")]
    public async Task<ActionResult<AttributeTemplateResponse>> CreateAttributeTemplate(AttributeTemplateUpsertRequest request)
    {
        var orgId = User.GetOrganizationId();
        var template = new AttributeTemplate { Name = request.Name, OrganizationId = orgId };
        db.AttributeTemplates.Add(template);
        await db.SaveChangesAsync();

        return Ok(new AttributeTemplateResponse(template.Id, template.Name));
    }

    [HttpPut("attribute-templates/{id:int}")]
    public async Task<ActionResult<AttributeTemplateResponse>> UpdateAttributeTemplate(int id, AttributeTemplateUpsertRequest request)
    {
        var orgId = User.GetOrganizationId();
        var template = await db.AttributeTemplates.FirstOrDefaultAsync(t => t.Id == id && t.OrganizationId == orgId);
        if (template is null) return NotFound();

        template.Name = request.Name;
        await db.SaveChangesAsync();

        return Ok(new AttributeTemplateResponse(template.Id, template.Name));
    }

    [HttpDelete("attribute-templates/{id:int}")]
    public async Task<IActionResult> DeleteAttributeTemplate(int id)
    {
        var orgId = User.GetOrganizationId();
        var template = await db.AttributeTemplates.FirstOrDefaultAsync(t => t.Id == id && t.OrganizationId == orgId);
        if (template is null) return NotFound();

        db.AttributeTemplates.Remove(template);
        await db.SaveChangesAsync();

        return NoContent();
    }
}
