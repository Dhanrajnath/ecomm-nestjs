import { Test, TestingModule } from "@nestjs/testing";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { User } from "src/users/entities/user.entity";
import { Task } from "./entities/task.entity";
import { TaskStatus } from "./task-status.enum";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskStatusDto } from "./dto/update-task-status.dto";
import { AuthGuard, PassportModule } from "@nestjs/passport";
import { ExecutionContext } from "@nestjs/common";

const mockUser: User = {
    id: 0,
    username: "mockUser",
    email: "mockuser@mock.com",
    password: "Mock@Password",
    tasks: []
};

const mockTasks: Task[] = [
    {
        id: "28e06153-4a19-4a1d-989a-71a6ee5955ff",
        title: "test1",
        description: "test description for test1",
        status: TaskStatus.OPEN,
        user: mockUser
    },
];

// Mock AuthGuard
class MockAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        // Mock implementation
        return true;
    }
}

describe('TasksController', () => {

    let controller: TasksController;
    let tasksService: TasksService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TasksController],
            providers: [
                {
                    provide: TasksService,
                    useValue: {
                        getTasks: jest.fn(),
                        getTaskById: jest.fn(),
                        createTask: jest.fn(),
                        deleteTask: jest.fn(),
                        updateTaskStatus: jest.fn(),
                    },
                },
                {
                    provide: AuthGuard,
                    useClass: MockAuthGuard
                }],
            imports: [PassportModule]
        }).compile();

        controller = module.get<TasksController>(TasksController);
        tasksService = module.get<TasksService>(TasksService);
    });

    describe('getTasks', () => {
        it('should return an array of tasks', async () => {
            jest.spyOn(tasksService, 'getTasks').mockResolvedValueOnce(mockTasks);

            const result = await controller.getTasks({}, mockUser);

            expect(result).toEqual(mockTasks);
        });
    });

    describe('getTaskById', () => {
        it('should return a task', async () => {
            const taskId = '28e06153-4a19-4a1d-989a-71a6ee5955ff';
            jest.spyOn(tasksService, 'getTaskById').mockResolvedValueOnce(mockTasks[0]);

            const result = await controller.getTaskById(taskId, mockUser);

            expect(result).toEqual(mockTasks[0]);
        });
    });

    describe('createTask', () => {
        it('should create a task', async () => {
            const createTaskDto: CreateTaskDto = {
                title: "test1",
                description: "test description for test1",
            };

            jest.spyOn(tasksService, 'createTask').mockResolvedValueOnce(mockTasks[0]);

            const result = await controller.createTask(createTaskDto, mockUser);

            expect(result).toEqual(mockTasks[0]);
        });
    });

    describe('updateTaskStatus', () => {
        it('should update task status', async () => {
            const taskId = '28e06153-4a19-4a1d-989a-71a6ee5955ff';
            const updateTaskStatusDto: UpdateTaskStatusDto = {
                status: TaskStatus.IN_PROGRESS
            };
            jest.spyOn(tasksService, 'updateTaskStatus').mockResolvedValueOnce(mockTasks[0]);

            const result = await controller.updateTaskStatus(taskId, updateTaskStatusDto, mockUser);

            expect(result).toEqual(mockTasks[0]);
        });
    });

    describe('deleteTask', () => {
        it('should delete a task', async () => {
            const taskId = '28e06153-4a19-4a1d-989a-71a6ee5955ff';
            jest.spyOn(tasksService, 'deleteTask').mockResolvedValueOnce(undefined);

            await expect(controller.deleteTask(taskId, mockUser)).resolves.toBeUndefined();
        });
    });
});