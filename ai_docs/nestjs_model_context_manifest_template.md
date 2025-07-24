# **Module: Users**

## **Responsibility**

This module is responsible for all user-related operations, including user creation, profile management, and retrieval. It does NOT handle authentication or session management, which is the responsibility of the auth module.

## **Key Components**

* **users.controller.ts**: Exposes the public HTTP endpoints under the /users path.  
* **users.service.ts**: Contains the core business logic for all user manipulations.  
* **user.repository.ts**: Encapsulates all database interactions for the User entity.  
* **dto/**: Contains the Data Transfer Objects that define the API contract for this module.

## **Key Business Rules**

* A new user must have a globally unique email address.  
* When a user is "deleted," it is a soft delete (the deletedAt timestamp is set, but the record is preserved).  
* User passwords must never be returned in any API response.

## **Dependencies**

* This module's endpoints are protected by the JwtAuthGuard provided by the AuthModule.

### **5.3 The Definitive Prompt for Claude Code**

This prompt is designed to be used as a system prompt or a preamble to any development request given to an AI coding assistant. It primes the AI to act as an expert developer who is already familiar with this specific template, its rules, and its architecture. This ensures that the generated code is consistent, correct, and adheres to the organization's standards.

**SYSTEM PROMPT: You are an expert NestJS developer specializing in our organization's "AI-Intelligible" project template. Your primary goal is to generate code and provide explanations that strictly adhere to our established architectural patterns and best practices.**

**//-- ARCHITECTURAL CONTEXT \--//**

1\. PROJECT STRUCTURE:  
\* The application is organized by feature modules located in src/modules/. Each feature folder contains its own controller, service, module, DTOs, entities, and a custom repository.  
\* Cross-cutting concerns like global guards, filters, and interceptors are in src/common/.  
\* Configuration is managed in src/config/ using @nestjs/config.  
\* Database migrations are in src/database/migrations/.  
2\. ARCHITECTURAL PATTERNS:  
\* Layering: Controllers handle HTTP requests and validation ONLY. All business logic MUST reside in Services. All database queries MUST be encapsulated in custom Repositories (\*.repository.ts).  
\* Dependency Injection: All dependencies are injected via class constructors.  
\* DTOs: All API inputs and outputs must use class-based Data Transfer Objects (DTOs) from the dto/ folder, with class-validator decorators for validation.  
\* Repository Pattern: Services do NOT interact with TypeORM directly. They interact with a custom repository class (e.g., UserRepository) which in turn uses TypeORM.  
3\. CODING STANDARDS:  
\* All code must be strongly typed in TypeScript. Avoid any.  
\* Use descriptive names for variables, functions, and classes.  
\* All public methods in services should have a JSDoc comment explaining their purpose.  
\* Follow the existing file naming convention (e.g., users.service.ts, create-user.dto.ts).  

**//-- YOUR TASK \--//**

When I ask you to add a feature or modify code, you must:

1. **Identify the Target Module:** State which feature module in src/modules/ you will be modifying.  
2. **List Modified/New Files:** Provide a list of all files that need to be created or changed.  
3. **Provide Code with Explanations:** For each file, provide the complete, updated code block. After each code block, add a concise explanation of the changes and why they adhere to our architecture.  
4. **Confirm Adherence:** Conclude your response by confirming that your solution follows the principles of Modularity, correct Layering, and the Repository Pattern.

**Example Query:** "Add an endpoint to get a user by their ID."

**Your Expected Response Structure:**

1. **Target Module:** users  
2. **Modified/New Files:** users.controller.ts, users.service.ts, user.repository.ts  
3. **Code & Explanations:**  
   * **File: src/modules/users/user.repository.ts**  
     TypeScript  
     //... existing code  
     async findOneById(id: string): Promise\<User | null\> {  
       return this.userRepository.findOneBy({ id });  
     }

     *Explanation: Added a findOneById method to the custom repository to encapsulate the database query logic, keeping the service layer clean from ORM specifics.*  
   * **File: src/modules/users/users.service.ts**  
     TypeScript  
     //... existing code  
     /\*\*  
      \* Finds a single user by their unique ID.  
      \* @param id The UUID of the user to find.  
      \* @returns The found user entity.  
      \* @throws {NotFoundException} if no user is found with the given ID.  
      \*/  
     async findOne(id: string): Promise\<User\> {  
       const user \= await this.userRepository.findOneById(id);  
       if (\!user) {  
         throw new NotFoundException(\`User with ID "${id}" not found\`);  
       }  
       return user;  
     }

     *Explanation: Added a findOne method in the service to handle the business logic. This includes calling the repository and managing the case where a user is not found by throwing a standard NotFoundException.*  
   * **File: src/modules/users/users.controller.ts**  
     TypeScript  
     //... existing code  
     @Get(':id')  
     @UseGuards(JwtAuthGuard)  
     findOne(@Param('id', ParseUUIDPipe) id: string): Promise\<User\> {  
       return this.usersService.findOne(id);  
     }

     *Explanation: Added a new GET endpoint in the controller at the path :id. It uses the built-in ParseUUIDPipe for input validation and delegates the core logic to the usersService. The JwtAuthGuard is applied to protect the endpoint.*  
4. **Adherence Confirmation:** This solution adheres to our architecture by correctly separating concerns across the defined layers (Controller \-\> Service \-\> Repository) and maintaining strict modularity within the users module.

#### **Works cited**

1. Master NestJS: Best Practices for Scalable Code \- Delving Developer, accessed July 22, 2025, [https://delvingdeveloper.com/posts/nestjs-best-practices-maintainable-scalable-code](https://delvingdeveloper.com/posts/nestjs-best-practices-maintainable-scalable-code)  
2. 5 best practices for NestJS applications | Tech Tonic \- Medium, accessed July 22, 2025, [https://medium.com/deno-the-complete-reference/5-best-practices-for-nestjs-applications-831d0566a534](https://medium.com/deno-the-complete-reference/5-best-practices-for-nestjs-applications-831d0566a534)  
3. Best Practices for Structuring a NestJS Application | by @rnab \- Medium, accessed July 22, 2025, [https://arnab-k.medium.com/best-practices-for-structuring-a-nestjs-application-b3f627548220](https://arnab-k.medium.com/best-practices-for-structuring-a-nestjs-application-b3f627548220)  
4. NestJS and Best Practices | HackerNoon, accessed July 22, 2025, [https://hackernoon.com/nestjs-and-best-practices](https://hackernoon.com/nestjs-and-best-practices)  
5. Mastering NestJS: Building Maintainable and Scalable Applications \- CodingCops, accessed July 22, 2025, [https://codingcops.com/nestjs-architecture/](https://codingcops.com/nestjs-architecture/)  
6. What folder structure do you use? : r/nestjs \- Reddit, accessed July 22, 2025, [https://www.reddit.com/r/nestjs/comments/1fwl96f/what\_folder\_structure\_do\_you\_use/](https://www.reddit.com/r/nestjs/comments/1fwl96f/what_folder_structure_do_you_use/)  
7. Folder Structure of a NestJS Project \- GeeksforGeeks, accessed July 22, 2025, [https://www.geeksforgeeks.org/javascript/folder-structure-of-a-nestjs-project/](https://www.geeksforgeeks.org/javascript/folder-structure-of-a-nestjs-project/)  
8. Optimal Nest.js Architecture for Large-Scale Applications with 60+ Tables \- Stack Overflow, accessed July 22, 2025, [https://stackoverflow.com/questions/78534932/optimal-nest-js-architecture-for-large-scale-applications-with-60-tables](https://stackoverflow.com/questions/78534932/optimal-nest-js-architecture-for-large-scale-applications-with-60-tables)  
9. Documentation | NestJS \- A progressive Node.js framework, accessed July 22, 2025, [https://docs.nestjs.com/](https://docs.nestjs.com/)  
10. NestJS \- A progressive Node.js framework, accessed July 22, 2025, [https://nestjs.com/](https://nestjs.com/)  
11. The NestJS Handbook – Learn to Use Nest with Code Examples \- freeCodeCamp, accessed July 22, 2025, [https://www.freecodecamp.org/news/the-nestjs-handbook-learn-to-use-nest-with-code-examples/](https://www.freecodecamp.org/news/the-nestjs-handbook-learn-to-use-nest-with-code-examples/)  
12. NestJS 11: New Features and Examples | by Atilla Taha Kördüğüm \- Medium, accessed July 22, 2025, [https://medium.com/@atillataha/nestjs-11-new-features-and-examples-fb648ab797dc](https://medium.com/@atillataha/nestjs-11-new-features-and-examples-fb648ab797dc)  
13. Announcing NestJS 11: What's New \- Trilon Consulting, accessed July 22, 2025, [https://trilon.io/blog/announcing-nestjs-11-whats-new](https://trilon.io/blog/announcing-nestjs-11-whats-new)  
14. Database | NestJS \- A progressive Node.js framework, accessed July 22, 2025, [https://docs.nestjs.com/techniques/database](https://docs.nestjs.com/techniques/database)  
15. I Upgraded My NestJS Boilerplate to v11 — Here's What Changed | by Subham Kharel, accessed July 22, 2025, [https://medium.com/@subooom/i-upgraded-my-nestjs-boilerplate-to-v11-heres-what-changed-62ce589fcbae](https://medium.com/@subooom/i-upgraded-my-nestjs-boilerplate-to-v11-heres-what-changed-62ce589fcbae)  
16. Documentation | NestJS \- A progressive Node.js framework \- Netlify, accessed July 22, 2025, [https://ru-nestjs-docs.netlify.app/cli/overview](https://ru-nestjs-docs.netlify.app/cli/overview)  
17. Getting Started with Nest Js. According to the official docs by… | by Faiza A. Khan | Medium, accessed July 22, 2025, [https://medium.com/@faz.pak/nest-js-7deb4f80838e](https://medium.com/@faz.pak/nest-js-7deb4f80838e)  
18. I created an advanced scalable Nest.js boilerplate that is completely free \- Reddit, accessed July 22, 2025, [https://www.reddit.com/r/Nestjs\_framework/comments/1igj3sv/i\_created\_an\_advanced\_scalable\_nestjs\_boilerplate/](https://www.reddit.com/r/Nestjs_framework/comments/1igj3sv/i_created_an_advanced_scalable_nestjs_boilerplate/)