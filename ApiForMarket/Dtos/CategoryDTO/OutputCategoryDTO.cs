namespace ApiForMarket.Dtos.CategoryDTO
{
    public class OutputCategoryDTO
    {

        public Guid Id { get; set; }
        public Guid? ParentId { get; set; }
        public string Name { get; set; }


        public List<OutputCategoryDTO>? Children { get; set; }

    }
}
