
import React from "react";
import { Search, SortAsc, Calendar, Mail, User, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

type SortOption = 'name' | 'date' | 'email' | 'gender';

interface PatientSearchProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sortBy: SortOption;
  onSortChange: (option: SortOption) => void;
  viewMode: 'cards' | 'list';
  onViewModeChange: (mode: 'cards' | 'list') => void;
}

const PatientSearch: React.FC<PatientSearchProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="relative mb-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
            <Input
              placeholder="Rechercher un patient par nom, email, téléphone..."
              className="pl-10 h-12 text-base rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              value={searchQuery}
              onChange={onSearchChange}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="px-4 min-w-36 justify-between rounded-xl border-blue-200 hover:bg-blue-50">
                <span className="flex items-center gap-2">
                  <SortAsc className="h-4 w-4 text-blue-500" />
                  {sortBy === 'name' && 'Trier par nom'}
                  {sortBy === 'date' && 'Trier par date'}
                  {sortBy === 'email' && 'Trier par email'}
                  {sortBy === 'gender' && 'Trier par genre'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuLabel>Options de tri</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSortChange('name')} className="cursor-pointer rounded-lg">
                <Users className="mr-2 h-4 w-4 text-blue-400" /> Par nom
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('date')} className="cursor-pointer rounded-lg">
                <Calendar className="mr-2 h-4 w-4 text-blue-400" /> Par date d'ajout
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('email')} className="cursor-pointer rounded-lg">
                <Mail className="mr-2 h-4 w-4 text-blue-400" /> Par email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('gender')} className="cursor-pointer rounded-lg">
                <User className="mr-2 h-4 w-4 text-blue-400" /> Par genre
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex gap-2">
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="icon" 
              className={`rounded-xl ${viewMode === 'list' ? 'bg-blue-400 hover:bg-blue-500 border-0' : 'border-blue-200'}`}
              onClick={() => onViewModeChange('list')}
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'cards' ? 'default' : 'outline'} 
              size="icon" 
              className={`rounded-xl ${viewMode === 'cards' ? 'bg-blue-400 hover:bg-blue-500 border-0' : 'border-blue-200'}`}
              onClick={() => onViewModeChange('cards')}
            >
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-1 h-1 bg-current rounded-sm"></div>
                <div className="w-1 h-1 bg-current rounded-sm"></div>
                <div className="w-1 h-1 bg-current rounded-sm"></div>
                <div className="w-1 h-1 bg-current rounded-sm"></div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSearch;
