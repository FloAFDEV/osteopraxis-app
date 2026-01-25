
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
    <div className="relative mb-4">
      <div className="bg-card rounded-md p-3 border">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-8 h-7 text-xs"
              value={searchQuery}
              onChange={onSearchChange}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                <SortAsc className="h-3 w-3 mr-1" />
                {sortBy === 'name' && 'Nom'}
                {sortBy === 'date' && 'Date'}
                {sortBy === 'email' && 'Email'}
                {sortBy === 'gender' && 'Genre'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuLabel>Trier par</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSortChange('name')} className="cursor-pointer">
                <Users className="mr-1.5 h-3 w-3" /> Nom
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('date')} className="cursor-pointer">
                <Calendar className="mr-1.5 h-3 w-3" /> Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('email')} className="cursor-pointer">
                <Mail className="mr-1.5 h-3 w-3" /> Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('gender')} className="cursor-pointer">
                <User className="mr-1.5 h-3 w-3" /> Genre
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex gap-0.5">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="h-7 w-7 p-0"
            >
              <Users className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('cards')}
              className="h-7 w-7 p-0"
            >
              <div className="grid grid-cols-2 gap-px">
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
