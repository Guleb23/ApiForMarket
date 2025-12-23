using ApiForMarket.Models;

namespace ApiForMarket.Dtos.Helpers
{
    public class Message
    {
        public Message(bool status, string text, StatusCodes code)
        {
            Status = status;
            MessageText = text;
            StatusCode = code;
        }


        public bool Status { get; set; }

        public string MessageText { get; set; }

        public StatusCodes StatusCode { get; set; }
    }
}
