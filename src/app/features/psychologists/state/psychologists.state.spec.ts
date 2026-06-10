import { TestBed } from '@angular/core/testing';
import { Store, provideStore } from '@ngxs/store';
import { of, throwError } from 'rxjs';
import {
  PsychologistsState,
  LoadPsychologists,
  SelectPsychologist,
} from './psychologists.state';
import { PsychologistService, Psychologist } from '../../../core/services/psychologist.service';

const mockPsychologist: Psychologist = {
  id: 'p-1',
  cognitoId: 'cog-1',
  name: 'Dr. Test',
  Specialization: 'Anxiety',
  location: 'Warsaw',
  hourlyRate: 200,
};

describe('PsychologistsState', () => {
  let store: Store;
  let getAllSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getAllSpy = vi.fn().mockReturnValue(of([mockPsychologist]));
    TestBed.configureTestingModule({
      providers: [
        provideStore([PsychologistsState]),
        {
          provide: PsychologistService,
          useValue: { getAll: getAllSpy },
        },
      ],
    });
    store = TestBed.inject(Store);
  });

  it('loads psychologists and sets items', async () => {
    await store.dispatch(new LoadPsychologists()).toPromise();

    expect(store.selectSnapshot(PsychologistsState.items)).toEqual([mockPsychologist]);
    expect(store.selectSnapshot(PsychologistsState.loading)).toBe(false);
  });

  it('passes keyword and location to service', async () => {
    await store.dispatch(new LoadPsychologists('anxiety', 'Warsaw')).toPromise();
    expect(getAllSpy).toHaveBeenCalledWith('anxiety', 'Warsaw');
  });

  it('sets selectedId on SelectPsychologist', async () => {
    await store.dispatch(new LoadPsychologists()).toPromise();
    await store.dispatch(new SelectPsychologist('p-1')).toPromise();

    expect(store.selectSnapshot(PsychologistsState.selected)).toEqual(mockPsychologist);
  });

  it('clears selectedId when null is dispatched', async () => {
    await store.dispatch(new SelectPsychologist('p-1')).toPromise();
    await store.dispatch(new SelectPsychologist(null)).toPromise();

    expect(store.selectSnapshot(PsychologistsState.selected)).toBeNull();
  });
});
