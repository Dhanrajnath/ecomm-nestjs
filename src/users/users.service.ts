import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) { }

  @Cron('30 * * * * *')
  handleCron() {
    console.log('called when the current second is 30');
  }

  async create(createUserDto: CreateUserDto): Promise<void> {

    // const { username, email, password } = createUserDto;

    const newUser = new User();
    newUser.username = createUserDto.username;
    newUser.email = createUserDto.email;
    //hash
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    newUser.password = hashedPassword;

    try {
      await this.usersRepository.save(newUser);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException("Username already exists!");
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const found = await this.usersRepository.findOneBy({ id });
    if (!found) {
      throw new NotFoundException(`User with id:${id} Not Found!`);
    }
    else {
      return found;
    }
  }

  async findUserName(username: string): Promise<User> {
    const found = await this.usersRepository.findOneBy({ username });
    if (!found) {
      throw new NotFoundException(`User with username:${username} Not Found!`);
    }
    else {
      return found;
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<string> {

    const updatedUser = await this.usersRepository.update({ id: id }, updateUserDto);

    if (updatedUser.affected === 0) {
      throw new NotFoundException(`User with id:${id} Not Found while attempting to update!`);
    } else {
      return `User with id:${id} updated successfully!`;
    }
  }

  async remove(id: number): Promise<string> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with id:${id} Not Found while attempting to delete!`);
    } else {
      return `User with id:${id} deleted successfully!`;
    }
  }
}
