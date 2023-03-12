import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User {

  @PrimaryGeneratedColumn()
  id: string;

  @Column("varchar", { nullable: false })
  password: string;

  @Column("varchar", { nullable: false, unique: true })
  login: string;

  @Column("varchar", { nullable: true, unique: true })
  email: string;

  @Column("varchar", { nullable: true })
  phone: string;

  @Column("varchar", { name: "first_name", nullable: true })
  firstName: string;

  @Column("varchar", { name: "last_name", nullable: true })
  lastName: string;

  @Index()
  @Column("boolean", { default: false })
  active: boolean;

  @Index()
  @CreateDateColumn({ name: "ts_created", type: "timestamp" })
  tsCreated: Date;

  get fullName() {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.login;
  }

}
