namespace InventorySystem.Api.Dtos;

public record PartCategoryResponse(int Id, string Name);

public record PartCategoryUpsertRequest(string Name);

public record PartSubCategoryResponse(int Id, string Name, int PartCategoryId);

public record PartSubCategoryUpsertRequest(string Name, int PartCategoryId);

public record CustomerCategoryResponse(int Id, string Name);

public record AttributeTemplateResponse(int Id, string Name);

public record AttributeTemplateUpsertRequest(string Name);
