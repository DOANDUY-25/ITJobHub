package itjobhub;

import itjobhub.entity.*;
import itjobhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (jobRepository.count() > 0) {
            return;
        }

        // 1. Create unique employer users for each company
        User uVortex = createEmployerUser("vortex@itjobhub.com");
        User uNexus = createEmployerUser("nexus@itjobhub.com");
        User uCerebrum = createEmployerUser("cerebrum@itjobhub.com");
        User uSkyward = createEmployerUser("skyward@itjobhub.com");
        User uMoby = createEmployerUser("moby@itjobhub.com");
        User uAcademy = createEmployerUser("academy@itjobhub.com");

        // 2. Create Companies linked to their respective users
        Company vortex = createCompany(uVortex, "Vortex Labs", "Remote", "Software Engineering & Web3", "51-200");
        Company nexus = createCompany(uNexus, "Nexus Financials", "Ha Noi", "Fintech & Banking Systems", "200+");
        Company cerebrum = createCompany(uCerebrum, "Cerebrum Systems", "Ho Chi Minh", "AI, LLMs & Data Science", "11-50");
        Company skyward = createCompany(uSkyward, "Skyward Inc.", "Da Nang", "Cloud Architecture & DevOps", "51-200");
        Company moby = createCompany(uMoby, "MobyApps", "Ho Chi Minh", "Mobile Application Development", "11-50");
        Company academy = createCompany(uAcademy, "ITJobHub Academy", "Ha Noi", "EdTech & IT Training", "1-10");

        // 3. Create Jobs
        jobRepository.save(Job.builder()
                .company(vortex)
                .title("Senior Frontend Architect (React)")
                .description("We are seeking a Frontend Architect to spearhead our next-generation SaaS product. You will design core rendering architectures, establish design systems, and lead a stellar team of React developers.")
                .requirements("- 5+ years of software development experience specializing in React.\n- Proficiency in TypeScript, build tools (Vite, Webpack), and modern state management.\n- Experience optimizing Core Web Vitals and SEO optimization.\n- Excellent leadership and architecture design skills.")
                .salaryMin(new BigDecimal("3500"))
                .salaryMax(new BigDecimal("5000"))
                .currency("USD")
                .salaryNegotiable(false)
                .status(JobStatus.PUBLISHED)
                .location("Remote")
                .jobType(JobType.FULL_TIME)
                .isFeatured(true)
                .isUrgent(false)
                .postedDate(LocalDateTime.now().minusHours(2))
                .expiryDate(LocalDateTime.now().plusDays(30))
                .build());

        jobRepository.save(Job.builder()
                .company(nexus)
                .title("Backend Engineer (Spring Boot & Cloud)")
                .description("Join our backend banking system scaling team. You will create secure, performant REST APIs, manage database scaling (MySQL), and configure microservice communication in Kubernetes.")
                .requirements("- 3+ years of experience with Java and Spring Framework (Boot, Security, Data).\n- Solid understanding of database systems (SQL queries optimization, indexing).\n- Familiarity with containerization (Docker, Kubernetes) and caching (Redis).\n- Experience building auth schemas and integrating OAuth2.")
                .salaryMin(new BigDecimal("25000000"))
                .salaryMax(new BigDecimal("35000000"))
                .currency("VND")
                .salaryNegotiable(false)
                .status(JobStatus.PUBLISHED)
                .location("Ha Noi")
                .jobType(JobType.FULL_TIME)
                .isFeatured(false)
                .isUrgent(true)
                .postedDate(LocalDateTime.now().minusDays(1))
                .expiryDate(LocalDateTime.now().plusDays(30))
                .build());

        jobRepository.save(Job.builder()
                .company(cerebrum)
                .title("AI & Data Science Specialist")
                .description("Create and deploy intelligence. Work directly with our data engines to implement custom LLM integrations, train computer vision pipelines, and package endpoints using FastAPI.")
                .requirements("- Strong Python foundations and machine learning frameworks (PyTorch, TensorFlow).\n- Experience deployment models on cloud architectures (AWS, GCP).\n- Solid command of linear algebra, calculus, and statistics.\n- PhD or MS in Computer Science, Math, or related field is a plus.")
                .salaryMin(new BigDecimal("4000"))
                .salaryMax(new BigDecimal("6000"))
                .currency("USD")
                .salaryNegotiable(false)
                .status(JobStatus.PUBLISHED)
                .location("Ho Chi Minh")
                .jobType(JobType.FULL_TIME)
                .isFeatured(true)
                .isUrgent(false)
                .postedDate(LocalDateTime.now().minusDays(3))
                .expiryDate(LocalDateTime.now().plusDays(30))
                .build());

        jobRepository.save(Job.builder()
                .company(skyward)
                .title("DevOps & Infrastructure Engineer")
                .description("Automate all things! We need a seasoned DevOps professional to maintain our AWS infrastructure via Terraform, establish robust GitHub Action workflows, and manage multi-stage Kubernetes pipelines.")
                .requirements("- 4+ years working in Cloud Infrastructures (AWS preferred).\n- Strong expertise writing Infrastructure as Code using Terraform.\n- Solid Shell scripting (Bash/Python) and Linux system administration.\n- Proficiency setting up monitoring suites (Prometheus, Grafana, ELK).")
                .salaryMin(new BigDecimal("2800"))
                .salaryMax(new BigDecimal("4200"))
                .currency("USD")
                .salaryNegotiable(false)
                .status(JobStatus.PUBLISHED)
                .location("Da Nang")
                .jobType(JobType.REMOTE)
                .isFeatured(false)
                .isUrgent(false)
                .postedDate(LocalDateTime.now().minusDays(4))
                .expiryDate(LocalDateTime.now().plusDays(30))
                .build());

        jobRepository.save(Job.builder()
                .company(moby)
                .title("React Native Developer")
                .description("We are seeking a React Native Developer to maintain and introduce new feature updates for our core iOS and Android e-commerce mobile applications.")
                .requirements("- 2+ years developing mobile apps with React Native.\n- Familiarity with native modules bridge configurations.\n- Proven experience releasing apps to Apple App Store or Google Play Store.\n- Understanding of offline storage, state management, and push notification services.")
                .salaryMin(new BigDecimal("20000000"))
                .salaryMax(new BigDecimal("30000000"))
                .currency("VND")
                .salaryNegotiable(false)
                .status(JobStatus.PUBLISHED)
                .location("Ho Chi Minh")
                .jobType(JobType.FULL_TIME)
                .isFeatured(false)
                .isUrgent(false)
                .postedDate(LocalDateTime.now().minusDays(5))
                .expiryDate(LocalDateTime.now().plusDays(30))
                .build());

        jobRepository.save(Job.builder()
                .company(academy)
                .title("Internship Software Engineer (Java/Web)")
                .description("Learn from senior engineers. As an intern, you will undergo structured training, assist in bug fixes, write automated tests, and gain hands-on experience building full-stack web architectures.")
                .requirements("- Final year student or self-taught developer in Computer Science.\n- Basic knowledge of object-oriented programming (OOP) in Java.\n- Familiarity with git workflow and SQL database engines.\n- Eager to learn, proactive, and positive attitude.")
                .salaryNegotiable(true)
                .status(JobStatus.PUBLISHED)
                .location("Ha Noi")
                .jobType(JobType.PART_TIME)
                .isFeatured(false)
                .isUrgent(false)
                .postedDate(LocalDateTime.now().minusDays(7))
                .expiryDate(LocalDateTime.now().plusDays(30))
                .build());
    }

    private User createEmployerUser(String email) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode("12345678"))
                    .authProvider(AuthProvider.LOCAL)
                    .role(Role.EMPLOYER)
                    .accountStatus(AccountStatus.ACTIVE)
                    .phone("0987654321")
                    .build();
            return userRepository.save(newUser);
        });
    }

    private Company createCompany(User user, String name, String location, String desc, String size) {
        Company company = companyRepository.findByCompanyName(name).orElse(null);
        if (company == null) {
            company = Company.builder()
                    .user(user)
                    .companyName(name)
                    .location(location)
                    .description(desc)
                    .size(size)
                    .industry("Technology")
                    .profileStatus(Company.ProfileStatus.APPROVED)
                    .build();
            company = companyRepository.save(company);
        }
        return company;
    }
}
