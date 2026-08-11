using AssignmentSubmissionSystem.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSubmissionSystem.Api.Models.Entities;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Subject> Subjects { get; set; }
    public DbSet<ClassCourse> Classes { get; set; }
    public DbSet<TeacherAssignment> TeacherAssignments { get; set; }
    public DbSet<StudentEnrollment> StudentEnrollments { get; set; }
    public DbSet<Assignment> Assignments { get; set; }
    public DbSet<Submission> Submissions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User entity configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Role).IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Subject entity configuration
        modelBuilder.Entity<Subject>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Code).HasMaxLength(50);
        });

        // ClassCourse entity configuration
        modelBuilder.Entity<ClassCourse>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.HasOne(e => e.Subject).WithMany(s => s.Classes).HasForeignKey(e => e.SubjectId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.CreatedByAdmin).WithMany(u => u.CreatedClasses).HasForeignKey(e => e.CreatedByAdminId).OnDelete(DeleteBehavior.Restrict);
        });

        // TeacherAssignment entity configuration
        modelBuilder.Entity<TeacherAssignment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Teacher).WithMany(u => u.TeacherAssignments).HasForeignKey(e => e.TeacherId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Class).WithMany(c => c.TeacherAssignments).HasForeignKey(e => e.ClassId).OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.TeacherId, e.ClassId }).IsUnique();
        });

        // StudentEnrollment entity configuration
        modelBuilder.Entity<StudentEnrollment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Student).WithMany(u => u.StudentEnrollments).HasForeignKey(e => e.StudentId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Class).WithMany(c => c.StudentEnrollments).HasForeignKey(e => e.ClassId).OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.StudentId, e.ClassId }).IsUnique();
        });

        // Assignment entity configuration
        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Description).IsRequired();
            entity.Property(e => e.MaxMarks).HasPrecision(10, 2);
            entity.HasOne(e => e.Class).WithMany(c => c.Assignments).HasForeignKey(e => e.ClassId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Teacher).WithMany(u => u.CreatedAssignments).HasForeignKey(e => e.TeacherId).OnDelete(DeleteBehavior.Restrict);
        });

        // Submission entity configuration
        modelBuilder.Entity<Submission>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AnswerContent).IsRequired();
            entity.Property(e => e.Marks).HasPrecision(10, 2);
            entity.Property(e => e.Feedback);
            entity.HasOne(e => e.Assignment).WithMany(a => a.Submissions).HasForeignKey(e => e.AssignmentId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Student).WithMany().HasForeignKey(e => e.StudentId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.GradedByTeacher).WithMany(u => u.GradedSubmissions).HasForeignKey(e => e.GradedByTeacherId).OnDelete(DeleteBehavior.SetNull);
            entity.HasIndex(e => new { e.AssignmentId, e.StudentId }).IsUnique();
        });
    }
}