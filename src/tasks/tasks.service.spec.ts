import { Test } from "@nestjs/testing";
import { Repository } from "typeorm";
import { Task } from "./entities/task.entity";
import { TasksService } from "./tasks.service";
import { User } from "../users/entities/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { TaskStatus } from "./task-status.enum";
import { NotFoundException } from "@nestjs/common";
import { CreateTaskDto } from "./dto/create-task.dto";
import { PassportModule } from "@nestjs/passport";

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

describe('TasksService', () => {

    let tasksRepository: Repository<Task>;
    let tasksService: TasksService;

    beforeEach(async () => {
        //init a nestJS module with tasksService & task repository
        const module = await Test.createTestingModule({
            providers: [
                TasksService,
                {
                    provide: getRepositoryToken(Task),
                    useClass: Repository
                }
            ],
            imports: [PassportModule]
        }).compile();

        tasksService = module.get(TasksService);
        tasksRepository = module.get(getRepositoryToken(Task));

    });

    // it('should be defined', () => {
    //     expect(tasksService).toBeDefined();
    // });

    describe('getTasks', () => {
        it('should return an array of tasks', async () => {

            jest.spyOn(tasksRepository, 'createQueryBuilder').mockReturnValue({
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(mockTasks),
            } as any);

            const result = await tasksService.getTasks({}, mockUser);

            expect(result).toEqual(mockTasks);
        });

        it('should return an array of tasks with few filters', async () => {

            jest.spyOn(tasksRepository, 'createQueryBuilder').mockReturnValue({
                where: jest.fn().mockReturnValue(mockTasks),
                andWhere: jest.fn().mockReturnValue(mockTasks),
                getMany: jest.fn().mockResolvedValue(mockTasks),
            } as any);

            const result = await tasksService.getTasks({ status: TaskStatus.OPEN, search: 'test' }, mockUser);

            expect(result).toEqual(mockTasks);
        });
    });

    describe('getTaskById', () => {
        it('should return a task if found', async () => {
            const mockTask: Task = {
                id: '1',
                title: 'Test Task',
                description: 'Test Description',
                status: TaskStatus.OPEN,
                user: mockUser,
            };

            jest.spyOn(tasksRepository, 'findOne').mockResolvedValue(mockTask);

            const result = await tasksService.getTaskById('1', mockUser);

            expect(result).toEqual(mockTask);
        });

        it('should throw NotFoundException if task is not found', async () => {

            jest.spyOn(tasksRepository, 'findOne').mockResolvedValue(null);

            await expect(tasksService.getTaskById('1', mockUser)).rejects.toThrow(NotFoundException);
        });
    })

    describe('createTask', () => {
        it('should create a task', async () => {
            const createTaskDto: CreateTaskDto = { title: 'Test Task', description: 'Test Description' };
            const createdTask: Task = { id: '1', ...createTaskDto, status: TaskStatus.OPEN, user: mockUser };

            jest.spyOn(tasksRepository, 'create').mockReturnValueOnce(createdTask);
            jest.spyOn(tasksRepository, 'save').mockResolvedValueOnce(createdTask);

            const result = await tasksService.createTask(createTaskDto, mockUser);

            expect(result).toEqual(createdTask);
            expect(tasksRepository.create).toHaveBeenCalledWith({
                ...createTaskDto,
                status: TaskStatus.OPEN,
                user: mockUser,
            });
            expect(tasksRepository.save).toHaveBeenCalledWith(createdTask);
        });
    });

    describe('updateTaskStatus', () => {
        it('should update the status of a task if found', async () => {
            const taskId = '28e06153-4a19-4a1d-989a-71a6ee5955ff';
            const status = TaskStatus.IN_PROGRESS;

            jest.spyOn(tasksService, 'getTaskById').mockResolvedValueOnce(mockTasks[0]);
            jest.spyOn(tasksRepository, 'save').mockResolvedValueOnce(mockTasks[0]);

            const result = await tasksService.updateTaskStatus(taskId, status, mockUser);

            expect(result).toEqual(mockTasks[0]);
            expect(mockTasks[0].status).toEqual(status);
            expect(tasksRepository.save).toHaveBeenCalledWith(mockTasks[0]);
        });

        it('should throw NotFoundException if task is not found', async () => {
            const taskId = '28e06153-4a19-4a1d-989a';
            const status = TaskStatus.IN_PROGRESS;

            jest.spyOn(tasksService, 'getTaskById').mockResolvedValueOnce(null);

            await expect(tasksService.updateTaskStatus(taskId, status, mockUser)).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteTask', () => {
        it('should delete a task if found', async () => {
            const taskId = '28e06153-4a19-4a1d-989a-71a6ee5955ff';

            jest.spyOn(tasksRepository, 'delete').mockResolvedValueOnce({ raw: [], affected: 1 });

            await tasksService.deleteTask(taskId, mockUser);

            expect(tasksRepository.delete).toHaveBeenCalledWith({ id: taskId, user: mockUser });
        });

        it('should throw NotFoundException if task is not found', async () => {
            const taskId = '28e06153-4a19-4a1d-989a-71a6ee5955ff';

            jest.spyOn(tasksRepository, 'delete').mockResolvedValueOnce({ raw: [], affected: 0 });

            await expect(tasksService.deleteTask(taskId, mockUser)).rejects.toThrow(NotFoundException);
        });
    });
});