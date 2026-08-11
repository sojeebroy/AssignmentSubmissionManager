using System.Text.Json;

namespace AssignmentSubmissionSystem.Api.Middleware 
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Unhandled exception: {ex.Message}\n{ex.StackTrace}");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var response = new
            {
                statusCode = context.Response.StatusCode,
                message = "An unexpected error occurred",
                details = exception.Message
            };

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;

            return context.Response.WriteAsJsonAsync(response);
        }
    }
}

