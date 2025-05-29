using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CalorieManagement.Core.Entities;
using CalorieManagement.Core.Interfaces;
using CalorieManagement.Application.DTOs;
using System.Text.Json;

namespace CalorieManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FoodController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public FoodController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<IActionResult> GetFoods(
        [FromQuery] string? category = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var foods = await _unitOfWork.Foods.FindAsync(f => f.IsActive);

        if (!string.IsNullOrEmpty(category))
            foods = foods.Where(f => f.Category.ToLower().Contains(category.ToLower()));

        if (!string.IsNullOrEmpty(search))
            foods = foods.Where(f => f.Name.ToLower().Contains(search.ToLower()));

        var totalCount = foods.Count();
        var pagedFoods = foods
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(f => new FoodDto
            {
                Id = f.Id,
                Name = f.Name,
                Description = f.Description,
                CaloriesPer100g = f.CaloriesPer100g,
                ProteinPer100g = f.ProteinPer100g,
                CarbsPer100g = f.CarbsPer100g,
                FatPer100g = f.FatPer100g,
                FiberPer100g = f.FiberPer100g,
                Category = f.Category,
                ImageUrl = f.ImageUrl
            })
            .ToList();

        return Ok(new
        {
            Foods = pagedFoods,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetFood(int id)
    {
        var food = await _unitOfWork.Foods.GetByIdAsync(id);
        if (food == null || !food.IsActive)
            return NotFound();

        var foodDto = new FoodDto
        {
            Id = food.Id,
            Name = food.Name,
            Description = food.Description,
            CaloriesPer100g = food.CaloriesPer100g,
            ProteinPer100g = food.ProteinPer100g,
            CarbsPer100g = food.CarbsPer100g,
            FatPer100g = food.FatPer100g,
            FiberPer100g = food.FiberPer100g,
            Category = food.Category,
            ImageUrl = food.ImageUrl
        };

        return Ok(foodDto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateFood([FromBody] CreateFoodDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var food = new Food
        {
            Name = model.Name,
            Description = model.Description,
            CaloriesPer100g = model.CaloriesPer100g,
            ProteinPer100g = model.ProteinPer100g,
            CarbsPer100g = model.CarbsPer100g,
            FatPer100g = model.FatPer100g,
            FiberPer100g = model.FiberPer100g,
            Category = model.Category,
            ImageUrl = model.ImageUrl ?? string.Empty
        };

        await _unitOfWork.Foods.AddAsync(food);
        await _unitOfWork.SaveChangesAsync();

        var foodDto = new FoodDto
        {
            Id = food.Id,
            Name = food.Name,
            Description = food.Description,
            CaloriesPer100g = food.CaloriesPer100g,
            ProteinPer100g = food.ProteinPer100g,
            CarbsPer100g = food.CarbsPer100g,
            FatPer100g = food.FatPer100g,
            FiberPer100g = food.FiberPer100g,
            Category = food.Category,
            ImageUrl = food.ImageUrl
        };

        return CreatedAtAction(nameof(GetFood), new { id = food.Id }, foodDto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateFood(int id, [FromBody] UpdateFoodDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var food = await _unitOfWork.Foods.GetByIdAsync(id);
        if (food == null)
            return NotFound();

        food.Name = model.Name;
        food.Description = model.Description;
        food.CaloriesPer100g = model.CaloriesPer100g;
        food.ProteinPer100g = model.ProteinPer100g;
        food.CarbsPer100g = model.CarbsPer100g;
        food.FatPer100g = model.FatPer100g;
        food.FiberPer100g = model.FiberPer100g;
        food.Category = model.Category;
        food.ImageUrl = model.ImageUrl ?? food.ImageUrl;

        // No Update method needed, just save changes
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteFood(int id)
    {
        var food = await _unitOfWork.Foods.GetByIdAsync(id);
        if (food == null)
            return NotFound();

        food.IsActive = false;
        // No Update method needed, just save changes
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var foods = await _unitOfWork.Foods.FindAsync(f => f.IsActive);
        var categories = foods
            .Select(f => f.Category)
            .Distinct()
            .Where(c => !string.IsNullOrEmpty(c))
            .OrderBy(c => c)
            .ToList();

        return Ok(categories);
    }
}
