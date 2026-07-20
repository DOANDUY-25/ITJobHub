package itjobhub.dto.job;

import itjobhub.entity.Job;
import itjobhub.entity.JobType;
import lombok.*;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobResponse {
    private Long id;
    private String title;
    private String company;
    private String logoUrl;
    private String logoColor;
    private String location;
    private String type;
    private String experience;
    private String salary;
    private List<String> skills;
    private String postedDate;
    private String description;
    private List<String> requirements;
    private Boolean isFeatured;
    private Boolean isUrgent;

    public static JobResponse fromEntity(Job job) {
        if (job == null) return null;

        // Convert requirements text to List<String>
        List<String> reqs = new ArrayList<>();
        if (job.getRequirements() != null && !job.getRequirements().isBlank()) {
            reqs = Arrays.stream(job.getRequirements().split("\r?\n"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(s -> s.startsWith("-") || s.startsWith("*") ? s.substring(1).trim() : s)
                    .collect(Collectors.toList());
        }

        // Format Salary
        String salaryStr = "Thỏa thuận";
        if (Boolean.FALSE.equals(job.getSalaryNegotiable())) {
            BigDecimal min = job.getSalaryMin();
            BigDecimal max = job.getSalaryMax();
            String curr = job.getCurrency() != null ? job.getCurrency() : "VND";

            if (min != null && max != null) {
                salaryStr = formatAmount(min, curr) + " - " + formatAmount(max, curr) + " " + curr;
            } else if (min != null) {
                salaryStr = "Từ " + formatAmount(min, curr) + " " + curr;
            } else if (max != null) {
                salaryStr = "Đến " + formatAmount(max, curr) + " " + curr;
            }
        }

        // Parse skills from requirements/title
        List<String> parsedSkills = new ArrayList<>();
        String textToAnalyze = (job.getTitle() + " " + job.getDescription() + " " + job.getRequirements()).toLowerCase();
        String[] keywords = {"react", "angular", "vue", "javascript", "typescript", "node.js", "java", "spring boot", "python", "django", "fastapi", "golang", "c#", "net core", "php", "laravel", "mysql", "postgresql", "mongodb", "redis", "docker", "kubernetes", "aws", "gcp", "azure", "devops", "ci/cd", "terraform", "html/css", "css", "git", "scrum", "agile", "next.js", "nest.js", "flutter", "react native", "swift", "kotlin", "android", "ios", "ai", "machine learning", "pytorch", "tensorflow", "mlops", "data science"};
        
        for (String kw : keywords) {
            if (textToAnalyze.contains(kw)) {
                parsedSkills.add(capitalizeSkill(kw));
            }
        }
        // Deduplicate and limit to 4 tags
        parsedSkills = parsedSkills.stream().distinct().limit(4).collect(Collectors.toList());
        if (parsedSkills.isEmpty()) {
            parsedSkills.add("Tech");
            parsedSkills.add("Software");
        }

        // Format posted date
        String formattedDate = "Gần đây";
        if (job.getPostedDate() != null) {
            formattedDate = job.getPostedDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        }

        // Generate gradient color based on company name hash
        String compName = job.getCompany() != null ? job.getCompany().getCompanyName() : "ITJobHub";
        String gradient = getGradientColor(compName);

        // Parse experience
        String exp = "Mọi cấp bậc";
        if (textToAnalyze.contains("senior") || textToAnalyze.contains("trưởng nhóm") || textToAnalyze.contains("5 năm")) {
            exp = "Senior";
        } else if (textToAnalyze.contains("mid") || textToAnalyze.contains("3 năm") || textToAnalyze.contains("2 năm")) {
            exp = "Mid-level";
        } else if (textToAnalyze.contains("intern") || textToAnalyze.contains("thực tập")) {
            exp = "Internship";
        } else if (textToAnalyze.contains("junior") || textToAnalyze.contains("1 năm")) {
            exp = "Junior";
        }

        return JobResponse.builder()
                .id(job.getJobId())
                .title(job.getTitle())
                .company(compName)
                .logoUrl(job.getCompany() != null ? job.getCompany().getLogoUrl() : null)
                .logoColor(gradient)
                .location(job.getLocation())
                .type(formatJobType(job.getJobType()))
                .experience(exp)
                .salary(salaryStr)
                .skills(parsedSkills)
                .postedDate(formattedDate)
                .description(job.getDescription())
                .requirements(reqs)
                .isFeatured(job.getIsFeatured())
                .isUrgent(job.getIsUrgent())
                .build();
    }

    private static String formatAmount(BigDecimal amount, String currency) {
        if (amount == null) return "";
        if ("USD".equalsIgnoreCase(currency)) {
            DecimalFormat df = new DecimalFormat("$#,##0");
            return df.format(amount);
        } else {
            DecimalFormat df = new DecimalFormat("#,##0");
            return df.format(amount);
        }
    }

    private static String formatJobType(JobType type) {
        if (type == null) return "Full-time";
        switch (type) {
            case FULL_TIME: return "Full-time";
            case PART_TIME: return "Part-time";
            case REMOTE: return "Remote";
            case FREELANCE: return "Freelance";
            default: return "Full-time";
        }
    }

    private static String capitalizeSkill(String skill) {
        switch (skill) {
            case "react": return "React";
            case "angular": return "Angular";
            case "vue": return "Vue";
            case "javascript": return "JavaScript";
            case "typescript": return "TypeScript";
            case "node.js": return "Node.js";
            case "java": return "Java";
            case "spring boot": return "Spring Boot";
            case "python": return "Python";
            case "django": return "Django";
            case "fastapi": return "FastAPI";
            case "golang": return "Go";
            case "c#": return "C#";
            case "net core": return ".NET Core";
            case "php": return "PHP";
            case "laravel": return "Laravel";
            case "mysql": return "MySQL";
            case "postgresql": return "PostgreSQL";
            case "mongodb": return "MongoDB";
            case "redis": return "Redis";
            case "docker": return "Docker";
            case "kubernetes": return "Kubernetes";
            case "aws": return "AWS";
            case "gcp": return "GCP";
            case "azure": return "Azure";
            case "devops": return "DevOps";
            case "ci/cd": return "CI/CD";
            case "terraform": return "Terraform";
            case "html/css": return "HTML/CSS";
            case "css": return "CSS";
            case "git": return "Git";
            case "scrum": return "Scrum";
            case "agile": return "Agile";
            case "next.js": return "Next.js";
            case "nest.js": return "Nest.js";
            case "flutter": return "Flutter";
            case "react native": return "React Native";
            case "swift": return "Swift";
            case "kotlin": return "Kotlin";
            case "android": return "Android";
            case "ios": return "iOS";
            case "ai": return "AI";
            case "machine learning": return "Machine Learning";
            case "pytorch": return "PyTorch";
            case "tensorflow": return "TensorFlow";
            case "mlops": return "MLOps";
            case "data science": return "Data Science";
            default:
                return Character.toUpperCase(skill.charAt(0)) + skill.substring(1);
        }
    }

    private static String getGradientColor(String name) {
        int hash = name.hashCode();
        String[][] gradients = {
            {"#a78bfa", "#7c3aed"}, // Purple
            {"#34d399", "#059669"}, // Green
            {"#60a5fa", "#2563eb"}, // Blue
            {"#f472b6", "#db2777"}, // Pink
            {"#fb7185", "#e11d48"}, // Rose
            {"#fbbf24", "#d97706"}, // Amber
            {"#22d3ee", "#0891b2"}  // Cyan
        };
        int idx = Math.abs(hash) % gradients.length;
        return "linear-gradient(135deg, " + gradients[idx][0] + ", " + gradients[idx][1] + ")";
    }
}
