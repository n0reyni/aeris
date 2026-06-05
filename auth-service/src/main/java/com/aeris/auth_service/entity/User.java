import jakarta.persistence.*;

public class User {
    @id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique=True)
    private String email;

    @Column(nullable=false)
    private String password;

    @Column(nullable=true)
    private String firstName;

    @Column(nullable=true)
    private String lastName;

    @Column
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private ROLE role = Role.USER;

    public Enum Role{
        USER, ADMIN
    }

    public Long getId(){ return id; }
    public void setId(Long id){this.id= id;}

    public String getEmail() {return email;}
    public void setEmail(String email) {this.email=email;}

    public String getPassword() { return password;}
    public void setPassword(String password) {this.password=password;}

    public String getFirstName() {return firstName;}
    public void setFirstName(String firstName) {this.firstName=firstName;}

    public String getLastName() {return lastName;}
    public void setLastName(String lastName) {this.lastName=lastName;}

    public String getPhoneNumber(){ return phoneNumber;}
    public void setPhoneNumber(String phoneNumber){this.phoneNumber=phoneNumber;}

    public String getRole() {return role;}
    public void setRole(String role){this.role=role;}
}
