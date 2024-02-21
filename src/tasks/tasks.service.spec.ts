import { Test } from "@nestjs/testing";
import { Repository } from "typeorm";
import { Task } from "./entities/task.entity";
import { TasksService } from "./tasks.service";
import { User } from "../users/entities/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { TaskStatus } from "./task-status.enum";
import { NotFoundException } from "@nestjs/common";

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

})