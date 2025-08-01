import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component'; // bien nommer la classe

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent]  // Importer le composant standalone
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the profile component', () => {
    expect(component).toBeTruthy();
  });
});
